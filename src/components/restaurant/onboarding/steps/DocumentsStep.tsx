
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Upload, FileText, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';
import { onboardingService } from '@/services/onboarding/onboardingService';
import type { RestaurantDocument } from '@/types/onboarding';

interface DocumentsStepProps {
  restaurantId: string;
  onComplete: (data: Record<string, any>) => void;
}

const REQUIRED_DOCUMENTS = [
  { type: 'business_license', label: 'Business License', required: true },
  { type: 'food_safety_certificate', label: 'Food Safety Certificate', required: true },
  { type: 'insurance_certificate', label: 'Insurance Certificate', required: true },
  { type: 'tax_registration', label: 'Tax Registration', required: true },
  { type: 'bank_statement', label: 'Bank Statement', required: false },
  { type: 'identity_proof', label: 'Identity Proof', required: true },
] as const;

export const DocumentsStep: React.FC<DocumentsStepProps> = ({ restaurantId, onComplete }) => {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<RestaurantDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    loadDocuments();
  }, [restaurantId]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const docs = await onboardingService.getRestaurantDocuments(restaurantId);
      setDocuments(docs);
    } catch (error) {
      console.error('Error loading documents:', error);
      toast({
        title: 'Error',
        description: 'Failed to load documents',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File, documentType: RestaurantDocument['document_type']) => {
    try {
      setUploading(documentType);
      const document = await onboardingService.uploadDocument(restaurantId, file, documentType);
      setDocuments(prev => [...prev.filter(d => d.document_type !== documentType), document]);
      toast({
        title: 'Success',
        description: `${documentType.replace('_', ' ')} uploaded successfully`,
      });
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload document',
        variant: 'destructive'
      });
    } finally {
      setUploading(null);
    }
  };

  const handleDeleteDocument = async (documentId: string, documentType: string) => {
    try {
      await onboardingService.deleteDocument(documentId);
      setDocuments(prev => prev.filter(d => d.id !== documentId));
      toast({
        title: 'Success',
        description: `${documentType.replace('_', ' ')} deleted successfully`,
      });
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete document',
        variant: 'destructive'
      });
    }
  };

  const handleSubmit = () => {
    const requiredDocs = REQUIRED_DOCUMENTS.filter(doc => doc.required);
    const uploadedRequiredDocs = requiredDocs.filter(doc => 
      documents.some(d => d.document_type === doc.type)
    );

    if (uploadedRequiredDocs.length < requiredDocs.length) {
      toast({
        title: 'Missing Documents',
        description: 'Please upload all required documents',
        variant: 'destructive'
      });
      return;
    }

    onComplete({ documents: documents.length });
  };

  const getDocumentStatus = (documentType: string) => {
    const doc = documents.find(d => d.document_type === documentType);
    if (!doc) return 'missing';
    return doc.verification_status;
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      case 'under_review':
        return <Badge variant="secondary">Under Review</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      default:
        return <Badge variant="outline">Missing</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-quantum-cyan"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        {REQUIRED_DOCUMENTS.map((docType) => {
          const existingDoc = documents.find(d => d.document_type === docType.type);
          const status = getDocumentStatus(docType.type);
          const isUploading = uploading === docType.type;

          return (
            <Card key={docType.type}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">
                    {docType.label} {docType.required && <span className="text-red-500">*</span>}
                  </CardTitle>
                  {renderStatusBadge(status)}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {existingDoc ? (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-blue-500" />
                      <span className="text-sm">{existingDoc.document_name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(existingDoc.document_url, '_blank')}
                      >
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteDocument(existingDoc.id, docType.label)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <Label htmlFor={`file-${docType.type}`} className="cursor-pointer">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                        <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">
                          {isUploading ? 'Uploading...' : 'Click to upload or drag and drop'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG up to 10MB</p>
                      </div>
                    </Label>
                    <input
                      id={`file-${docType.type}`}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      disabled={isUploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload(file, docType.type);
                        }
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Button onClick={handleSubmit} className="w-full">
        Continue
      </Button>
    </div>
  );
};
