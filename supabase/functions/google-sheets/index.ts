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
  const serviceAccountEmail = Deno.env.get('bcb-accounting@bcb-accounting-data.iam.gserviceaccount.com');
  const privateKeyRaw = Deno.env.get('-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDCpRG90TH3csUT\njszMNQIuoOSRCWaipZ6BgIh3oW9UDkoI2CsZjyxXAglEsP+9O4pK9adC25ZRDTlp\nnsBkN/lcB2SyZY6E7MKC+WABNfOD0zGVoGoSDAu1r5lCGv1AVAxUk+Sf+FHwH621\nTv2N9+dC9bQV4UJZlIENxrWD+VBb8JnZdp8JagbK0SXu+rJyc/qpEtq3/8uw2HZ7\nBuCiAeFbUoCabwrmkW8AsVa+ed8EZzKx8zCr0NCcwtRMeu4NRlBGW76hahHXICzx\n0/2RRkz+fuJOwjDotzcykPsrYg4gX6zTpeHYM8gfkJndkcndya7Qm8vLcf5QBB3x\npIxT44mtAgMBAAECggEACjij3V1qa82dlsDVdVXFRxCQ4CLnvlvHHpLS18Fk+LuF\nXMCJRt7TW8BSH0bSLyw8v2H2BhdE5f21SZwaC0k7MX975LhbixRpxHn29ilQn9gL\nzwks+MSkKsbNXADR0rp3KUvY4iOmnd7z/sTmoLlnbgc8DTgWhWC8hC4uov8JHsLE\nuKB7jp3rKYfSZOeVmB9CqxhpxMzVCz6bqtAJspxSa0/wHBBMsW5cm/GT/0EasWGv\n3+TWP6XjNRtmgmd7VJtT1JJ9ocWqfnvlaCEQPzitpXP0ATEIZcrz2MjCrDz8bKxZ\nIXEcOO3jswqjdTjPoINs+Kq6BpQnvLYozF4ENTUuGwKBgQDvoAEfjv+GZiHqNHOE\nVr3lJQ88LTfMnXIfxCMO49vAbUeHb7BxKgNkG+PdUw4NNV/DyHSnJ52jed8IrjlZ\nxnGOheu7Fi0yrTm/MLjOSvbG8WD24en7o5Q85DbruFCjJGASwdT3GRd1Ti2gk+BW\n0LUO63T2WnUCVE02+AfkHdCP+wKBgQDP8i6Om74qS4sMz7FIY24rD6sJFZ2SGCYv\n7YxqL6koW8XpXBtEP+qwAiJQ7caADzIvrYX3Fp5zsSU1mIdykrr8mT/VZ6i2PXjK\nqSfze/LZKwNBXh0CN4j87d1t9QvKJk3L2XzitbrLLgvxJyhw+zlV1jj4OzsSwV2/\n65qbGkMUdwKBgQChWLto5IBpnpt3d5nQohd7E1kOy+Omgt01RnvUqths2SgwqaPE\njuV5os3rWOE9Q5MX4QGrC6G5UXY8AhPbvyL3NHVlo6kLVlhrxAKr5Q4FJsKDedpy\n9dH6ri/MyG6DaxrFhn4/Y0XIVruiQ+/qhN1lDmXS+1WOG/Vh7eBiWTD1wQKBgGoX\nSSGA2/iAKiUTIYOpFt/pUn2EBawvnev96hGS116707FHSLH9WiMKM6/OX+Od3SDu\nCtcRNy4XRsCdXR1bNwMAvMyH4k939VSQEM3sgu3BQBvthCdJZh6EzN/4kVdFS5Oh\nFlIkHXTjvTv/mmZqBcqBTPd4YJ8lAEuWTH6tW2PpAoGBAI0cOT7VQLuT8yLhrlf5\ncOP9GHQN+ySdZPHwl7RvWfTErvT9BbXi0ZxvGL/SBjRYs1FX6i7X3ZaTCt5bgVP9\n0UGMf0+M7m0fny4Jgryztd/dvBQEyLyBcPwZsrjUYNhdC9pw+xB1bYmb+VWtXufZ\nMwMeb3McuMeQVbKxO3ENogA/\n-----END PRIVATE KEY-----\n');
  
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
