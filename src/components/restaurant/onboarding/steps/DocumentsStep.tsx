
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, FileText, Trash2, Check, Clock, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { onboardingService } from '@/services/onboarding/onboardingService';
import type { RestaurantDocument } from '@/types/onboarding';

interface DocumentsStepProps {
  restaurantId: string;
  onComplete: (data: Record<string, any>) => void;
}

const REQUIRED_DOCUMENTS = [
  {
    type: 'business_license' as const,
    title: 'Business License',
    description: 'Valid business registration document',
    required: true
  },
  {
    type: 'food_safety_certificate' as const,
    title: 'Food Safety Certificate',
    description: 'Food handling and safety certification',
    required: true
  },
  {
    type: 'insurance_certificate' as const,
    title: 'Insurance Certificate',
    description: 'Business liability insurance',
    required: true
  },
  {
    type: 'tax_registration' as const,
    title: 'Tax Registration',
    description: 'Tax identification number',
    required: false
  },
  {
    type: 'bank_statement' as const,
    title: 'Bank Statement',
    description: 'Recent business bank statement',
    required: false
  },
  {
    type: 'identity_proof' as const,
    title: 'Identity Proof',
    description: 'Government-issued ID of business owner',
    required: true
  }
];

export const DocumentsStep: React.FC<DocumentsStepProps> = ({ restaurantId, onComplete }) => {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<RestaurantDocument[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
        description: 'Document uploaded successfully'
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
        description: 'Document deleted successfully'
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

  const getDocumentStatus = (documentType: string) => {
    return documents.find(d => d.document_type === documentType);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <X className="h-4 w-4 text-red-500" />;
      case 'under_review':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'under_review':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const canComplete = () => {
    const requiredDocs = REQUIRED_DOCUMENTS.filter(d => d.required);
    return requiredDocs.every(doc => getDocumentStatus(doc.type));
  };

  const handleComplete = () => {
    if (!canComplete()) {
      toast({
        title: 'Missing Documents',
        description: 'Please upload all required documents',
        variant: 'destructive'
      });
      return;
    }

    const documentsSummary = documents.reduce((acc, doc) => {
      acc[doc.document_type] = {
        status: doc.verification_status,
        uploaded_at: doc.uploaded_at
      };
      return acc;
    }, {} as Record<string, any>);

    onComplete({ documents: documentsSummary });
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
      <div className="space-y-4">
        {REQUIRED_DOCUMENTS.map((docType) => {
          const existingDoc = getDocumentStatus(docType.type);
          const isUploading = uploading === docType.type;

          return (
            <Card key={docType.type} className="border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-gray-500" />
                    <div>
                      <h3 className="font-medium">{docType.title}</h3>
                      <p className="text-sm text-gray-600">{docType.description}</p>
                    </div>
                    {docType.required && <Badge variant="outline">Required</Badge>}
                  </div>

                  {existingDoc && (
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(existingDoc.verification_status)}
                      <Badge className={getStatusColor(existingDoc.verification_status)}>
                        {existingDoc.verification_status.replace('_', ' ')}
                      </Badge>
                    </div>
                  )}
                </div>

                {existingDoc ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between bg-gray-50 p-3 rounded">
                      <div>
                        <p className="font-medium">{existingDoc.document_name}</p>
                        <p className="text-sm text-gray-500">
                          Uploaded {new Date(existingDoc.uploaded_at).toLocaleDateString()}
                        </p>
                        {existingDoc.verification_notes && (
                          <p className="text-sm text-red-600 mt-1">
                            Note: {existingDoc.verification_notes}
                          </p>
                        )}
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
                          onClick={() => handleDeleteDocument(existingDoc.id, existingDoc.document_type)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor={`replace-${docType.type}`}>Replace Document</Label>
                      <Input
                        id={`replace-${docType.type}`}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleFileUpload(file, docType.type);
                          }
                        }}
                        disabled={isUploading}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor={`file-${docType.type}`}>Upload Document</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id={`file-${docType.type}`}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleFileUpload(file, docType.type);
                          }
                        }}
                        disabled={isUploading}
                        className="flex-1"
                      />
                      {isUploading && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-quantum-cyan"></div>
                          <span>Uploading...</span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      Accepted formats: PDF, JPG, PNG, DOC, DOCX (Max 10MB)
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Button 
        onClick={handleComplete} 
        disabled={!canComplete()} 
        className="w-full"
      >
        Continue to Next Step
      </Button>
    </div>
  );
};
