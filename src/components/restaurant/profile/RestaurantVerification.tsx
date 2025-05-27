
import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Upload, FileText, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { restaurantService, type Restaurant, type VerificationDocument } from '@/services/restaurantService';

interface Props {
  restaurant: Restaurant;
  onUpdate: (restaurant: Restaurant) => void;
}

const documentTypes = [
  { value: 'business_license', label: 'Business License', required: true },
  { value: 'food_handler_permit', label: 'Food Handler Permit', required: true },
  { value: 'insurance_certificate', label: 'Insurance Certificate', required: false },
  { value: 'tax_document', label: 'Tax Document', required: false },
  { value: 'identity_document', label: 'Identity Document', required: true },
] as const;

export const RestaurantVerification: React.FC<Props> = ({ restaurant, onUpdate }) => {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<VerificationDocument[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocuments();
  }, [restaurant.id]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const data = await restaurantService.getVerificationDocuments(restaurant.id);
      setDocuments(data);
    } catch (error: any) {
      console.error('Error loading documents:', error);
      toast({
        title: "Error",
        description: "Failed to load verification documents",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (
    file: File,
    documentType: VerificationDocument['document_type']
  ) => {
    try {
      setUploading(documentType);
      const document = await restaurantService.uploadVerificationDocument(
        restaurant.id,
        file,
        documentType
      );
      setDocuments(prev => [...prev, document]);
      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });
    } catch (error: any) {
      console.error('Error uploading document:', error);
      toast({
        title: "Error",
        description: "Failed to upload document",
        variant: "destructive",
      });
    } finally {
      setUploading(null);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    try {
      await restaurantService.deleteVerificationDocument(documentId);
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      toast({
        title: "Success",
        description: "Document deleted successfully",
      });
    } catch (error: any) {
      console.error('Error deleting document:', error);
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive",
      });
    }
  };

  const getDocumentForType = (type: string) => {
    return documents.find(doc => doc.document_type === type);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
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
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-quantum-cyan" />
        <span className="ml-2 text-quantum-cyan">Loading verification documents...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Verification Status</CardTitle>
          <CardDescription>
            Upload required documents to verify your restaurant
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              {getStatusIcon(restaurant.verification_status)}
              <span className="font-medium capitalize">
                {restaurant.verification_status.replace('_', ' ')}
              </span>
            </div>
            <Badge className={getStatusColor(restaurant.verification_status)}>
              {restaurant.verification_status === 'approved' && 'Verified'}
              {restaurant.verification_status === 'rejected' && 'Rejected'}
              {restaurant.verification_status === 'pending' && 'Pending Review'}
              {restaurant.verification_status === 'under_review' && 'Under Review'}
            </Badge>
          </div>
          
          {restaurant.verification_notes && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Verification Notes</h4>
              <p className="text-blue-700">{restaurant.verification_notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Required Documents</CardTitle>
          <CardDescription>
            Upload the following documents for verification
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {documentTypes.map(({ value, label, required }) => {
              const existingDoc = getDocumentForType(value);
              const isUploading = uploading === value;

              return (
                <div key={value} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-gray-500" />
                      <span className="font-medium">{label}</span>
                      {required && <Badge variant="outline">Required</Badge>}
                    </div>
                    
                    {existingDoc && (
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(existingDoc.verification_status)}
                        <Badge className={getStatusColor(existingDoc.verification_status)}>
                          {existingDoc.verification_status}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {existingDoc ? (
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
                          onClick={() => handleDeleteDocument(existingDoc.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor={`file-${value}`}>Choose file</Label>
                      <Input
                        id={`file-${value}`}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleFileUpload(file, value);
                          }
                        }}
                        disabled={isUploading}
                      />
                      {isUploading && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Uploading...</span>
                        </div>
                      )}
                      <p className="text-sm text-gray-500">
                        Accepted formats: PDF, JPG, PNG, DOC, DOCX (Max 10MB)
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
