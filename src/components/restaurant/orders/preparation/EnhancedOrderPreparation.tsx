
import React, { useState } from 'react';
import { OrderHeader } from './OrderHeader';
import { OrderDetailsCard } from './OrderDetailsCard';
import { BulkStageActions } from './BulkStageActions';
import { PreparationStagesCard } from './PreparationStagesCard';
import { StageNotesModal } from './StageNotesModal';
import { usePreparationStages } from '@/hooks/usePreparationStages';
import { useOrderContext } from '@/contexts/OrderContext';

export const EnhancedOrderPreparation: React.FC = () => {
  const { order } = useOrderContext();
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState<string>('');
  
  const {
    updateNotes,
    overallProgress
  } = usePreparationStages(order.id!);

  const handleAddNotes = (stageName: string) => {
    setSelectedStage(stageName);
    setNotesModalOpen(true);
  };

  const handleSaveNotes = (notes: string) => {
    if (selectedStage) {
      updateNotes(selectedStage, notes);
    }
  };

  return (
    <div className="space-y-6">
      <OrderHeader order={order} overallProgress={overallProgress || 0} />
      
      <OrderDetailsCard order={order} />

      <BulkStageActions 
        orderId={order.id!}
        onMarkAllComplete={() => {
          console.log('Bulk action completed');
        }}
        onSkipToReady={() => {
          console.log('Skipped to ready');
        }}
      />

      <PreparationStagesCard orderId={order.id!} />

      <StageNotesModal
        isOpen={notesModalOpen}
        onClose={() => setNotesModalOpen(false)}
        onSave={handleSaveNotes}
        stageName={selectedStage}
      />
    </div>
  );
};
