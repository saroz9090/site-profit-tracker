import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/contexts/DataContext';
import { RefreshCw, Link, Unlink, ExternalLink, Loader2 } from 'lucide-react';

export function SheetsConnection() {
  const {
    isConnected,
    isLoading,
    isSyncing,
    spreadsheetId,
    connect,
    connectExisting,
    disconnect,
    syncFromSheets,
  } = useData();

  const [existingId, setExistingId] = useState('');
  const [showExistingInput, setShowExistingInput] = useState(false);

  const handleConnectExisting = () => {
    if (existingId.trim()) {
      connectExisting(existingId.trim());
      setExistingId('');
      setShowExistingInput(false);
    }
  };

  const openSpreadsheet = () => {
    if (spreadsheetId) {
      window.open(`https://docs.google.com/spreadsheets/d/${spreadsheetId}`, '_blank');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Google Sheets Backend
              {isConnected ? (
                <Badge variant="default" className="bg-green-600">Connected</Badge>
              ) : (
                <Badge variant="secondary">Not Connected</Badge>
              )}
            </CardTitle>
            <CardDescription>
              Sync your data with Google Sheets for backup and external access
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isConnected ? (
          <>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Spreadsheet ID:</span>
              <code className="bg-muted px-2 py-1 rounded text-xs">{spreadsheetId}</code>
              <Button variant="ghost" size="icon" onClick={openSpreadsheet}>
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={syncFromSheets}
                disabled={isSyncing}
              >
                {isSyncing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Sync Now
              </Button>
              <Button variant="destructive" onClick={disconnect}>
                <Unlink className="h-4 w-4 mr-2" />
                Disconnect
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="flex gap-2">
              <Button onClick={connect} disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Link className="h-4 w-4 mr-2" />
                )}
                Create New Spreadsheet
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowExistingInput(!showExistingInput)}
              >
                Connect Existing
              </Button>
            </div>
            {showExistingInput && (
              <div className="flex gap-2">
                <Input
                  placeholder="Enter Spreadsheet ID"
                  value={existingId}
                  onChange={(e) => setExistingId(e.target.value)}
                />
                <Button onClick={handleConnectExisting}>Connect</Button>
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              Creating a new spreadsheet will set up all required sheets with proper headers.
              Data will automatically sync when you add new entries.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
