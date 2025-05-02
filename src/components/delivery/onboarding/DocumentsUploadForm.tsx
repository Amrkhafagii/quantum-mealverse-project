
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Upload, Check, X, FileText, Camera, Calendar as CalendarIcon } from 'lucide-react';
import { DeliveryDocument } from '@/types/delivery';
import { Loader2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';

interface DocumentsUploadFormProps {
  onDocumentUpload: (
    file: File, 
    documentType: DeliveryDocument['document_type'],
    expiryDate?: Date,
    notes?: string
  ) => Promise<DeliveryDocument | null>;
  onCompleteStep: () => boolean;
  existingDocuments: DeliveryDocument[];
  isVehicleDriver: boolean;
  isLoading: boolean;
}

type DocumentConfig = {
  type: DeliveryDocument['document_type'];
  title: string;
  description: string;
  required: boolean;
  requiresExpiry?: boolean;
  requiredFor?: ('car' | 'motorcycle' | 'scooter')[];
};

export const DocumentsUploadForm: React.FC<DocumentsUploadFormProps> = ({
  onDocumentUpload,
  onCompleteStep,
  existingDocuments,
  isVehicleDriver,
  isLoading,
}) => {
  const [uploadType, setUploadType] = useState<DeliveryDocument['document_type'] | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(undefined);
  const [notes, setNotes] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  const documents: DocumentConfig[] = [
    {
      type: 'profile_photo',
      title: 'Profile Photo',
      description: 'A clear photo of your face',
      required: true,
    },
    {
      type: 'drivers_license',
      title: 'Driver\'s License',
      description: 'Valid government-issued photo ID',
      required: true,
      requiresExpiry: true,
    },
    {
      type: 'vehicle_registration',
      title: 'Vehicle Registration',
      description: 'Current vehicle registration document',
      required: isVehicleDriver,
      requiredFor: ['car', 'motorcycle'],
    },
    {
      type: 'insurance',
      title: 'Vehicle Insurance',
      description: 'Proof of valid insurance',
      required: isVehicleDriver,
      requiresExpiry: true,
      requiredFor: ['car', 'motorcycle'],
    },
    {
      type: 'identity',
      title: 'Other ID',
      description: 'Additional identification if needed',
      required: false,
    },
    {
      type: 'background_check',
      title: 'Background Check Consent',
      description: 'Signed background check authorization',
      required: false,
    }
  ];

  const getDocumentStatus = (type: DeliveryDocument['document_type']) => {
    return existingDocuments.find(doc => doc.document_type === type);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !uploadType) return;
    
    setIsUploading(true);
    try {
      await onDocumentUpload(file, uploadType, expiryDate, notes);
      // Reset form
      setFile(null);
      setUploadType(null);
      setExpiryDate(undefined);
      setNotes('');
    } finally {
      setIsUploading(false);
    }
  };

  const completeDocumentsStep = () => {
    return onCompleteStep();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Documents & Verification</h2>
        <p className="text-gray-400 mt-1">Upload the required documents for verification</p>
      </div>

      {/* Upload Dialog */}
      {uploadType && (
        <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-1">
                  {documents.find(d => d.type === uploadType)?.title}
                </h3>
                <p className="text-sm text-gray-400">
                  {documents.find(d => d.type === uploadType)?.description}
                </p>
              </div>

              <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 flex flex-col items-center justify-center">
                {!file ? (
                  <>
                    <Label htmlFor="document-upload" className="cursor-pointer flex flex-col items-center">
                      <Upload className="h-10 w-10 text-quantum-cyan mb-2" />
                      <span className="text-sm font-medium">Click to upload</span>
                      <span className="text-xs text-gray-400 mt-1">JPG, PNG or PDF up to 5MB</span>
                    </Label>
                    <input
                      id="document-upload"
                      type="file"
                      className="hidden"
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                    />
                  </>
                ) : (
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      <FileText className="h-8 w-8 text-quantum-cyan mr-3" />
                      <div>
                        <p className="text-sm font-medium truncate max-w-[200px]">{file.name}</p>
                        <p className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFile(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              {documents.find(d => d.type === uploadType)?.requiresExpiry && (
                <div>
                  <Label htmlFor="expiry-date" className="block mb-2">
                    Expiry Date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="expiry-date"
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !expiryDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {expiryDate ? format(expiryDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={expiryDate}
                        onSelect={setExpiryDate}
                        initialFocus
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}

              <div>
                <Label htmlFor="notes" className="block mb-2">
                  Additional Notes (Optional)
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Add any relevant information about this document..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setFile(null);
                    setUploadType(null);
                    setExpiryDate(undefined);
                    setNotes('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="flex-1"
                  onClick={handleUpload}
                  disabled={!file || isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    'Upload'
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Document List */}
      {!uploadType && (
        <div className="space-y-4">
          {documents.map((doc) => {
            if (!doc.required && !isVehicleDriver && doc.requiredFor) return null;
            
            const docStatus = getDocumentStatus(doc.type);
            
            return (
              <Card 
                key={doc.type} 
                className={cn(
                  "bg-quantum-darkBlue/30",
                  docStatus ? "border-green-600/30" : "border-quantum-cyan/20"
                )}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center">
                    {docStatus ? (
                      <div className="h-10 w-10 rounded-full bg-green-600/20 flex items-center justify-center mr-4">
                        <Check className="h-5 w-5 text-green-500" />
                      </div>
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-quantum-cyan/10 flex items-center justify-center mr-4">
                        {doc.type === 'profile_photo' ? (
                          <Camera className="h-5 w-5 text-quantum-cyan" />
                        ) : (
                          <FileText className="h-5 w-5 text-quantum-cyan" />
                        )}
                      </div>
                    )}
                    <div>
                      <h3 className="font-medium">{doc.title}</h3>
                      <p className="text-xs text-gray-400">{doc.description}</p>
                    </div>
                  </div>
                  <div>
                    {docStatus ? (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setUploadType(doc.type)}
                      >
                        Replace
                      </Button>
                    ) : (
                      <Button 
                        variant={doc.required ? "default" : "outline"} 
                        size="sm"
                        onClick={() => setUploadType(doc.type)}
                      >
                        Upload
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {!uploadType && (
        <div className="pt-4">
          <Button 
            onClick={completeDocumentsStep}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Continue'
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
