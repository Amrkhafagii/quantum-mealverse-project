
import { useState } from 'react';
import { BatchPreparationService, BatchStageUpdate, BatchStageResult } from '@/services/preparation/batchPreparationService';

export const useBatchPreparation = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [batchResults, setBatchResults] = useState<BatchStageResult[]>([]);

  const batchAdvanceStages = async (updates: BatchStageUpdate[]) => {
    setIsProcessing(true);
    try {
      const results = await BatchPreparationService.batchAdvanceStages(updates);
      setBatchResults(results);
      return results;
    } finally {
      setIsProcessing(false);
    }
  };

  const batchMarkReady = async (orderIds: string[]) => {
    setIsProcessing(true);
    try {
      const results = await BatchPreparationService.batchMarkOrdersReady(orderIds);
      setBatchResults(results);
      return results;
    } finally {
      setIsProcessing(false);
    }
  };

  const batchUpdateNotes = async (
    updates: Array<{ orderId: string; stageName: string; notes: string }>
  ) => {
    setIsProcessing(true);
    try {
      const success = await BatchPreparationService.batchUpdateStageNotes(updates);
      return success;
    } finally {
      setIsProcessing(false);
    }
  };

  const batchSkipStages = async (
    updates: Array<{ orderId: string; stageName: string; reason?: string }>
  ) => {
    setIsProcessing(true);
    try {
      const success = await BatchPreparationService.batchSkipStages(updates);
      return success;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    batchResults,
    batchAdvanceStages,
    batchMarkReady,
    batchUpdateNotes,
    batchSkipStages
  };
};
