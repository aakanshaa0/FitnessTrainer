"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { vapi } from '@/lib/vapi';

interface DebugInfo {
  vapiApiKey: string;
  vapiAssistantId: string;
  geminiApiKey: string;
  mongodbUri: string;
  environment: string;
  timestamp: string;
}

interface TestResult {
  type?: string;
  success: boolean;
  status: number | string;
  data?: Record<string, unknown>;
  error?: string;
  timestamp: string;
}

const DebugPanel = () => {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [testResults, setTestResults] = useState<TestResult | null>(null);

  useEffect(() => {
    const info: DebugInfo = {
      vapiApiKey: process.env.NEXT_PUBLIC_VAPI_API_KEY ? 'Set' : 'Missing',
      vapiAssistantId: process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID ? 'Set' : 'Missing',
      geminiApiKey: process.env.GEMINI_API_KEY ? 'Set' : 'Missing',
      mongodbUri: process.env.MONGODB_URI ? 'Set' : 'Missing',
      environment: process.env.NODE_ENV || 'unknown',
      timestamp: new Date().toISOString()
    };
    setDebugInfo(info);
  }, []);

  const testVapiConfig = async () => {
    try {
      const vapiConfig = {
        apiKey: process.env.NEXT_PUBLIC_VAPI_API_KEY ? 'Valid' : 'Missing',
        assistantId: process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID ? 'Valid' : 'Missing',
        hasVapiInstance: !!vapi
      };
      
      setTestResults({
        type: 'vapi',
        success: vapiConfig.apiKey === 'Valid' && vapiConfig.assistantId === 'Valid',
        status: 200,
        data: vapiConfig,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      setTestResults({
        type: 'vapi',
        success: false,
        status: 500,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  };

  const testGeminiAPI = async () => {
    try {
      const response = await fetch('/api/generate-program', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: 'debug_test',
          age: 25,
          height: "5'8\"",
          weight: '150 lbs',
          injuries: 'None',
          workout_days: 3,
          fitness_goal: 'weight loss',
          fitness_level: 'beginner',
          dietary_restrictions: 'None',
          activity_level: 'moderately active',
        }),
      });

      const result = await response.json();
      setTestResults({
        status: response.status,
        success: response.ok,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      setTestResults({
        status: 'Error',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
    }
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          variant="outline"
          size="sm"
          className="bg-background/80 backdrop-blur-sm"
        >
          🐛 Debug
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm p-4 overflow-auto">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-card/90 backdrop-blur-sm border border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                🐛 Debug Panel
                <Badge variant={debugInfo?.geminiApiKey === 'Set' ? 'default' : 'destructive'}>
                  {debugInfo?.geminiApiKey === 'Set' ? 'Ready' : 'Not Ready'}
                </Badge>
              </CardTitle>
              <Button
                onClick={() => setIsVisible(false)}
                variant="outline"
                size="sm"
              >
                ✕ Close
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/*Environment Variables Status*/}
            <div>
              <h3 className="text-lg font-semibold mb-3">Environment Variables</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">VAPI API Key:</span>
                    <Badge variant={debugInfo?.vapiApiKey === 'Set' ? 'default' : 'destructive'}>
                      {debugInfo?.vapiApiKey}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">VAPI Assistant ID:</span>
                    <Badge variant={debugInfo?.vapiAssistantId === 'Set' ? 'default' : 'destructive'}>
                      {debugInfo?.vapiAssistantId}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Gemini API Key:</span>
                    <Badge variant={debugInfo?.geminiApiKey === 'Set' ? 'default' : 'destructive'}>
                      {debugInfo?.geminiApiKey}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">MongoDB URI:</span>
                    <Badge variant={debugInfo?.mongodbUri === 'Set' ? 'default' : 'destructive'}>
                      {debugInfo?.mongodbUri}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Environment:</span>
                    <Badge variant="outline">{debugInfo?.environment}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Timestamp:</span>
                    <Badge variant="outline">{debugInfo?.timestamp}</Badge>
                  </div>
                </div>
              </div>
            </div>

            {/*Test Buttons*/}
            <div>
              <h3 className="text-lg font-semibold mb-3">Test Connections</h3>
              <div className="flex gap-4">
                <Button onClick={testGeminiAPI} variant="outline">
                  Test Gemini API
                </Button>
                <Button onClick={testVapiConfig} variant="outline">
                  Test VAPI Config
                </Button>
              </div>
            </div>

            {/*Test Results*/}
            {testResults && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Test Results</h3>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium">Status:</span>
                    <Badge variant={testResults.success ? 'default' : 'destructive'}>
                      {testResults.success ? 'Success' : 'Failed'}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    Timestamp: {testResults.timestamp}
                  </div>
                  <pre className="text-xs bg-background p-2 rounded overflow-auto max-h-40">
                    {JSON.stringify(testResults, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/*Troubleshooting Tips*/}
            <div>
              <h3 className="text-lg font-semibold mb-3">Troubleshooting Tips</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>• Check that all environment variables are set in <code>.env.local</code></div>
                <div>• Restart the development server after changing environment variables</div>
                <div>• Verify API keys are valid and have proper permissions</div>
                <div>• Check browser console and server logs for detailed error messages</div>
                <div>• Ensure MongoDB is running and accessible</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DebugPanel;
