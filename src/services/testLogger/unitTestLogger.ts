
import { supabase } from '@/integrations/supabase/client';

interface UnitTestResult {
  test_name: string;
  function_name: string;
  input?: any;
  expected_output?: any;
  actual_output?: any;
  passed: boolean;
  error_message?: string;
  execution_time: number;
  timestamp?: string;
}

export const logUnitTestResult = async (result: UnitTestResult) => {
  try {
    const { error } = await supabase
      .from('unit_test_customer')
      .insert({
        ...result,
        timestamp: new Date().toISOString()
      });

    if (error) {
      console.error('Failed to log unit test result:', error);
    }
  } catch (err) {
    console.error('Error in logUnitTestResult:', err);
  }
};

export const createUnitTest = (functionName: string) => {
  return async (testName: string, testFn: () => Promise<any>, expectedOutput?: any) => {
    const startTime = performance.now();
    let passed = false;
    let error = null;
    let actualOutput = null;

    try {
      actualOutput = await testFn();
      passed = expectedOutput ? JSON.stringify(actualOutput) === JSON.stringify(expectedOutput) : true;
    } catch (err: any) {
      error = err;
      passed = false;
    }

    const executionTime = performance.now() - startTime;

    await logUnitTestResult({
      test_name: testName,
      function_name: functionName,
      input: null, // We don't store inputs for security
      expected_output: expectedOutput,
      actual_output: actualOutput,
      passed,
      error_message: error?.message,
      execution_time: executionTime
    });

    return passed;
  };
};
