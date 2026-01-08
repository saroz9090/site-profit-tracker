import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { create, getNumericDate } from "https://deno.land/x/djwt@v2.8/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Sheet names for each data type
const SHEET_NAMES = {
  projects: 'Projects',
  materials: 'Materials',
  bills: 'Bills',
  payments: 'Payments',
  contractors: 'ContractorWorks',
  contractorPayments: 'ContractorPayments',
  employees: 'Employees',
  salaryPayments: 'SalaryPayments',
  transactions: 'Transactions',
};

async function getAccessToken(): Promise<string> {
  const serviceAccountEmail = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_EMAIL');
  const privateKeyRaw = Deno.env.get('GOOGLE_PRIVATE_KEY');
  
  if (!serviceAccountEmail || !privateKeyRaw) {
    throw new Error('Google credentials not configured');
  }
  
  // Handle escaped newlines in the private key
  const privateKey = privateKeyRaw.replace(/\\n/g, '\n');
  
  // Create JWT for Google OAuth
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: serviceAccountEmail,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };
  
  // Import the private key
  const pemHeader = '-----BEGIN PRIVATE KEY-----';
  const pemFooter = '-----END PRIVATE KEY-----';
  const pemContents = privateKey.replace(pemHeader, '').replace(pemFooter, '').replace(/\s/g, '');
  const binaryKey = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));
  
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    binaryKey,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const jwt = await create({ alg: 'RS256', typ: 'JWT' }, payload, cryptoKey);
  
  // Exchange JWT for access token
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });
  
  const tokenData = await tokenResponse.json();
  if (!tokenData.access_token) {
    console.error('Token response:', tokenData);
    throw new Error('Failed to get access token');
  }
  
  return tokenData.access_token;
}

async function getSheetData(accessToken: string, spreadsheetId: string, sheetName: string): Promise<any[]> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}`;
  
  const response = await fetch(url, {
    headers: { 'Authorization': `Bearer ${accessToken}` },
  });
  
  if (!response.ok) {
    const error = await response.text();
    console.error(`Failed to get sheet ${sheetName}:`, error);
    return [];
  }
  
  const data = await response.json();
  const rows = data.values || [];
  
  if (rows.length < 2) return [];
  
  const headers = rows[0];
  return rows.slice(1).map((row: string[]) => {
    const obj: Record<string, string> = {};
    headers.forEach((header: string, i: number) => {
      obj[header] = row[i] || '';
    });
    return obj;
  });
}

async function appendToSheet(accessToken: string, spreadsheetId: string, sheetName: string, values: any[]): Promise<void> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ values }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to append to sheet: ${error}`);
  }
}

async function updateSheetRow(accessToken: string, spreadsheetId: string, sheetName: string, rowIndex: number, values: any[]): Promise<void> {
  const range = `${sheetName}!A${rowIndex + 2}`;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`;
  
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ values: [values] }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to update row: ${error}`);
  }
}

async function createSpreadsheetWithSheets(accessToken: string, title: string): Promise<string> {
  const sheets = Object.values(SHEET_NAMES).map(name => ({
    properties: { title: name }
  }));
  
  const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: { title },
      sheets,
    }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create spreadsheet: ${error}`);
  }
  
  const data = await response.json();
  return data.spreadsheetId;
}

async function initializeSheetHeaders(accessToken: string, spreadsheetId: string): Promise<void> {
  const headers: Record<string, string[]> = {
    Projects: ['id', 'name', 'customer', 'startDate', 'status', 'totalBilled', 'totalReceived', 'totalMaterialCost', 'totalLabourCost', 'totalOtherCost'],
    Materials: ['id', 'date', 'projectId', 'projectName', 'supplier', 'material', 'unit', 'quantity', 'unitPrice', 'totalAmount'],
    Bills: ['id', 'billNumber', 'date', 'projectId', 'projectName', 'customer', 'description', 'amount', 'amountReceived', 'status'],
    Payments: ['id', 'date', 'billId', 'billNumber', 'projectId', 'projectName', 'customer', 'paymentMode', 'amount'],
    ContractorWorks: ['id', 'date', 'contractorId', 'contractorName', 'contractorType', 'projectId', 'projectName', 'description', 'workValue', 'amountPaid', 'status'],
    ContractorPayments: ['id', 'date', 'workId', 'contractorId', 'contractorName', 'projectId', 'projectName', 'paymentMode', 'amount'],
    Employees: ['id', 'name', 'role', 'salary', 'assignedTo', 'projectId', 'projectName'],
    SalaryPayments: ['id', 'date', 'employeeId', 'employeeName', 'month', 'costType', 'paymentMode', 'amount', 'projectId', 'projectName'],
    Transactions: ['id', 'date', 'type', 'description', 'amount', 'mode'],
  };
  
  for (const [sheetName, headerRow] of Object.entries(headers)) {
    const range = `${sheetName}!A1`;
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`;
    
    await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values: [headerRow] }),
    });
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, spreadsheetId, sheetType, data, rowIndex } = await req.json();
    
    console.log(`Processing action: ${action}, sheetType: ${sheetType}`);
    
    const accessToken = await getAccessToken();
    
    switch (action) {
      case 'create': {
        const newSpreadsheetId = await createSpreadsheetWithSheets(accessToken, 'BuildTrack Data');
        await initializeSheetHeaders(accessToken, newSpreadsheetId);
        return new Response(JSON.stringify({ 
          success: true, 
          spreadsheetId: newSpreadsheetId,
          message: 'Spreadsheet created with all sheets and headers'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      case 'read': {
        if (!spreadsheetId || !sheetType) {
          throw new Error('spreadsheetId and sheetType are required');
        }
        const sheetName = SHEET_NAMES[sheetType as keyof typeof SHEET_NAMES];
        if (!sheetName) {
          throw new Error(`Invalid sheetType: ${sheetType}`);
        }
        const rows = await getSheetData(accessToken, spreadsheetId, sheetName);
        return new Response(JSON.stringify({ success: true, data: rows }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      case 'append': {
        if (!spreadsheetId || !sheetType || !data) {
          throw new Error('spreadsheetId, sheetType, and data are required');
        }
        const sheetName = SHEET_NAMES[sheetType as keyof typeof SHEET_NAMES];
        if (!sheetName) {
          throw new Error(`Invalid sheetType: ${sheetType}`);
        }
        await appendToSheet(accessToken, spreadsheetId, sheetName, data);
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      case 'update': {
        if (!spreadsheetId || !sheetType || !data || rowIndex === undefined) {
          throw new Error('spreadsheetId, sheetType, data, and rowIndex are required');
        }
        const sheetName = SHEET_NAMES[sheetType as keyof typeof SHEET_NAMES];
        if (!sheetName) {
          throw new Error(`Invalid sheetType: ${sheetType}`);
        }
        await updateSheetRow(accessToken, spreadsheetId, sheetName, rowIndex, data);
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      case 'readAll': {
        if (!spreadsheetId) {
          throw new Error('spreadsheetId is required');
        }
        const allData: Record<string, any[]> = {};
        for (const [key, sheetName] of Object.entries(SHEET_NAMES)) {
          allData[key] = await getSheetData(accessToken, spreadsheetId, sheetName);
        }
        return new Response(JSON.stringify({ success: true, data: allData }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in google-sheets function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
