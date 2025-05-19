
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AdaptiveForm } from '@/components/forms/AdaptiveForm';
import { z } from 'zod';
import { Platform } from '@/utils/platform';
import { useResponsive } from '@/contexts/ResponsiveContext';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Check, AlertTriangle } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

// Form validation schema
const profileSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Please enter a valid email address'),
  bio: z.string().optional(),
  country: z.string().min(1, 'Please select your country'),
  receiveNotifications: z.boolean().default(true),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const AdaptiveFormDemo = () => {
  const { toast } = useToast();
  const { theme } = useTheme();
  const { isPlatformIOS, isPlatformAndroid } = useResponsive();
  const [useNative, setUseNative] = useState(Platform.isNative());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formResult, setFormResult] = useState<ProfileFormValues | null>(null);

  const defaultValues: ProfileFormValues = {
    username: '',
    email: '',
    bio: '',
    country: '',
    receiveNotifications: true,
  };

  const handleSubmit = async (data: ProfileFormValues) => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setFormResult(data);
    setIsSubmitting(false);
    
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated."
    });
  };

  const countryOptions = [
    { value: 'us', label: 'United States' },
    { value: 'ca', label: 'Canada' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'au', label: 'Australia' },
    { value: 'de', label: 'Germany' },
    { value: 'fr', label: 'France' },
    { value: 'jp', label: 'Japan' },
  ];

  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-3xl font-bold mb-6">Adaptive Form Demo</h1>
      
      {Platform.isNative() && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="use-native">Use Native Form Controls</Label>
                <p className="text-sm text-muted-foreground">
                  Toggle between web and native form controls
                </p>
              </div>
              <Switch 
                id="use-native" 
                checked={useNative} 
                onCheckedChange={setUseNative}
              />
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
            <CardDescription>
              Update your profile information
              {isPlatformIOS && " with iOS-styled form controls"}
              {isPlatformAndroid && " with Material Design form controls"}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <AdaptiveForm
              schema={profileSchema}
              defaultValues={defaultValues}
              onSubmit={handleSubmit}
              useNativeControls={useNative}
              submitText="Update Profile"
              isSubmitting={isSubmitting} // Remove this prop since it's not defined in the component
            >
              <AdaptiveForm.Field
                name="username"
                label="Username"
                placeholder="Enter username"
                autoComplete="username"
              />
              
              <AdaptiveForm.Field
                name="email"
                label="Email Address"
                placeholder="your@email.com"
                type="email"
                autoComplete="email"
              />
              
              <AdaptiveForm.Field
                name="bio"
                label="Bio"
                placeholder="Tell us about yourself"
                multiline
                rows={3}
              />
              
              <AdaptiveForm.Field
                name="country"
                label="Country"
                type="select"
                placeholder="Select your country"
                options={countryOptions}
              />
              
              <AdaptiveForm.Field
                name="receiveNotifications"
                label="Receive Notifications"
                type="switch"
              />
            </AdaptiveForm>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Form Result</CardTitle>
            <CardDescription>
              This shows the data submitted by the form
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {formResult ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-500 dark:text-green-400">
                  <Check size={18} />
                  <span>Form submitted successfully</span>
                </div>
                
                <div className="rounded-md bg-muted p-4 font-mono text-sm">
                  <pre className="whitespace-pre-wrap break-all">
                    {JSON.stringify(formResult, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <Alert variant="default" className="bg-muted">
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                <AlertDescription>
                  No data submitted yet. Fill out the form and click submit.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-between border-t bg-muted/50 px-6 py-3">
            <p className="text-xs text-muted-foreground">
              Form adapts to {isPlatformIOS ? 'iOS' : isPlatformAndroid ? 'Android' : 'Web'} platform
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AdaptiveFormDemo;
