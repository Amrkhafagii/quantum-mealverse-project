
import React from 'react';
import { z } from 'zod';
import { useToast } from "@/hooks/use-toast";
import { Platform } from '@/utils/platform';
import { useResponsive } from '@/contexts/ResponsiveContext';
import { cn } from '@/lib/utils';
import { AdaptiveForm } from '@/components/ui/adaptive-form';
import { 
  AdaptiveInputField, 
  AdaptiveTextAreaField,
  AdaptiveSelectField,
  AdaptiveCheckboxField
} from '@/components/ui/adaptive-form-fields';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { hapticFeedback } from '@/utils/hapticFeedback';

const profileFormSchema = z.object({
  username: z
    .string()
    .min(2, { message: "Username must be at least 2 characters." })
    .max(30, { message: "Username cannot be longer than 30 characters." }),
  email: z
    .string()
    .email({ message: "Please enter a valid email address." }),
  bio: z
    .string()
    .max(500, { message: "Bio cannot be longer than 500 characters." })
    .optional(),
  country: z
    .string()
    .min(1, { message: "Please select a country." }),
  receiveNotifications: z
    .boolean()
    .default(false),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const countries = [
  { value: "us", label: "United States" },
  { value: "ca", label: "Canada" },
  { value: "gb", label: "United Kingdom" },
  { value: "fr", label: "France" },
  { value: "de", label: "Germany" },
  { value: "jp", label: "Japan" },
  { value: "au", label: "Australia" },
];

const AdaptiveFormDemo = () => {
  const { toast } = useToast();
  const { isPlatformIOS, isPlatformAndroid } = useResponsive();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const defaultValues: Partial<ProfileFormValues> = {
    username: "",
    email: "",
    bio: "",
    country: "",
    receiveNotifications: false,
  };

  async function onSubmit(data: ProfileFormValues) {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log("Form submitted:", data);
    
    toast({
      title: "Profile updated",
      description: "Your profile has been successfully updated.",
    });
    
    setIsSubmitting(false);
    
    // Platform-specific success feedback
    if (Platform.isNative()) {
      hapticFeedback.success();
    }
  }

  const getPlatformHeaderStyles = () => {
    if (isPlatformIOS) {
      return {
        title: "text-2xl font-semibold text-center text-blue-500",
        description: "text-center text-gray-500"
      };
    }
    
    if (isPlatformAndroid) {
      return {
        title: "text-xl font-medium text-primary",
        description: "text-gray-600 text-sm"
      };
    }
    
    return {
      title: "text-2xl font-semibold",
      description: "text-muted-foreground"
    };
  };
  
  const headerStyles = getPlatformHeaderStyles();

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className={cn(
        isPlatformIOS ? "rounded-xl shadow-lg" : "",
        isPlatformAndroid ? "rounded-md shadow" : ""
      )}>
        <CardHeader>
          <CardTitle className={headerStyles.title}>
            {isPlatformIOS ? "iOS-Style Profile" : 
             isPlatformAndroid ? "Android Profile" : 
             "Edit Your Profile"}
          </CardTitle>
          <CardDescription className={headerStyles.description}>
            Update your profile information using our adaptive form components.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdaptiveForm
            schema={profileFormSchema}
            onSubmit={onSubmit}
            defaultValues={defaultValues}
            submitText={isSubmitting ? "Updating..." : "Update Profile"}
            showReset={true}
            resetText="Cancel"
            loading={isSubmitting}
          >
            <div className="space-y-4">
              <AdaptiveInputField
                name="username"
                label="Username"
                placeholder="Enter your username"
                required
              />
              
              <AdaptiveInputField
                name="email"
                label="Email"
                type="email"
                placeholder="Enter your email"
                required
                autoComplete="email"
              />
              
              <AdaptiveTextAreaField
                name="bio"
                label="Bio"
                placeholder="Tell us about yourself"
                rows={4}
              />
              
              <AdaptiveSelectField
                name="country"
                label="Country"
                placeholder="Select your country"
                options={countries}
                required
              />
              
              <AdaptiveCheckboxField
                name="receiveNotifications"
                label="Receive notifications"
                description="We'll send you updates about your account activity."
              />
            </div>
          </AdaptiveForm>
          
          <div className="mt-8 p-4 border rounded-lg bg-gray-50">
            <h3 className="font-medium mb-2">Current Platform</h3>
            <p>
              <strong>Detected platform: </strong> 
              {isPlatformIOS ? "iOS" : 
               isPlatformAndroid ? "Android" : 
               "Web"}
            </p>
            <div className="mt-4 flex gap-2">
              <Button 
                variant={isPlatformIOS ? "default" : "outline"}
                className={isPlatformIOS ? "bg-blue-500 text-white" : ""}
                onClick={() => toast({
                  title: "iOS Experience",
                  description: "Currently showing iOS-style form components"
                })}
              >
                iOS Style
              </Button>
              <Button 
                variant={isPlatformAndroid ? "default" : "outline"}
                className={isPlatformAndroid ? "bg-primary text-white" : ""}
                onClick={() => toast({
                  title: "Android Experience",
                  description: "Currently showing Android-style form components"
                })}
              >
                Android Style
              </Button>
              <Button 
                variant={!isPlatformIOS && !isPlatformAndroid ? "default" : "outline"}
                onClick={() => toast({
                  title: "Web Experience",
                  description: "Currently showing web-style form components"
                })}
              >
                Web Style
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdaptiveFormDemo;
