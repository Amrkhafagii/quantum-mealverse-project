
import React, { useState, useEffect } from 'react';
import { useStorage, useStorageMigration } from '@/hooks/useStorage';
import { storageManager } from '@/services/storage/StorageManager';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

export const StorageDemo = () => {
  const [key, setKey] = useState('demo_key');
  const [inputValue, setInputValue] = useState('');
  const { value, setValue, removeValue, isLoading, error, storageType } = useStorage<string>(key, '');
  const [allKeys, setAllKeys] = useState<string[]>([]);
  const [importText, setImportText] = useState('');
  const [exportText, setExportText] = useState('');
  const { exportStorageData, importStorageData, isExporting, isImporting } = useStorageMigration();

  // Load all keys
  useEffect(() => {
    const loadKeys = async () => {
      const keys = await storageManager.keys();
      setAllKeys(keys);
    };
    loadKeys();
  }, [value]);

  const handleSave = async () => {
    await setValue(inputValue);
    setInputValue('');
    updateKeysList();
  };

  const handleRemove = async () => {
    await removeValue();
    updateKeysList();
  };

  const updateKeysList = async () => {
    const keys = await storageManager.keys();
    setAllKeys(keys);
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear all storage data?')) {
      await storageManager.clear();
      updateKeysList();
    }
  };

  const handleExport = async () => {
    const data = await exportStorageData();
    if (data) {
      setExportText(data);
    }
  };

  const handleImport = async () => {
    if (!importText) return;
    try {
      const success = await importStorageData(importText);
      if (success) {
        alert('Data imported successfully');
        updateKeysList();
        setImportText('');
      }
    } catch (error) {
      alert(`Import failed: ${error}`);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Storage Manager Demo</h1>
      <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-md">
        <p className="text-sm">
          Current Storage Implementation: <strong>{storageType}</strong>
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Storage Operations</CardTitle>
            <CardDescription>Test basic storage operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="key">Storage Key</Label>
                <Input 
                  id="key" 
                  value={key} 
                  onChange={e => setKey(e.target.value)}
                  placeholder="Enter key name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="value">Value to Store</Label>
                <Input 
                  id="value" 
                  value={inputValue} 
                  onChange={e => setInputValue(e.target.value)}
                  placeholder="Enter value to store"
                />
              </div>
              
              <div className="pt-2">
                <Label>Current Stored Value:</Label>
                <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded mt-1 min-h-[40px]">
                  {isLoading ? 'Loading...' : value || '[empty]'}
                </div>
              </div>
              
              {error && (
                <div className="text-red-500 text-sm mt-2">
                  Error: {error.message}
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button onClick={handleSave}>Save Value</Button>
            <Button variant="outline" onClick={handleRemove}>Remove Value</Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Storage Keys</CardTitle>
            <CardDescription>Currently stored keys</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-[200px] overflow-y-auto border rounded">
              {allKeys.length > 0 ? (
                <ul className="divide-y">
                  {allKeys.map((k, i) => (
                    <li key={i} className="p-2 hover:bg-gray-50 dark:hover:bg-gray-800">
                      {k}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-4 text-center text-gray-500">No keys stored</div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="destructive" onClick={handleClearAll}>
              Clear All Storage
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <Separator />
      
      <h2 className="text-xl font-semibold">Storage Migration Utils</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Export Data</CardTitle>
            <CardDescription>Export all storage data</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea 
              value={exportText} 
              readOnly 
              className="h-[200px]" 
              placeholder="Exported data will appear here"
            />
          </CardContent>
          <CardFooter>
            <Button onClick={handleExport} disabled={isExporting}>
              {isExporting ? 'Exporting...' : 'Export All Data'}
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Import Data</CardTitle>
            <CardDescription>Import storage data (will merge with existing)</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea 
              value={importText} 
              onChange={e => setImportText(e.target.value)}
              className="h-[200px]"
              placeholder="Paste exported data here"
            />
          </CardContent>
          <CardFooter>
            <Button onClick={handleImport} disabled={isImporting || !importText}>
              {isImporting ? 'Importing...' : 'Import Data'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
