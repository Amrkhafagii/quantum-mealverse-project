import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Smartphone, 
  Monitor, 
  Tablet, 
  Cpu, 
  Wifi, 
  WifiOff,
  Battery,
  Signal,
  RotateCcw,
  Sun,
  Moon,
  MapPin,
  Bell,
  Settings,
  User,
  ChevronRight,
  Heart,
  Share
} from 'lucide-react';
import { useResponsive } from '@/responsive/core';
import { AdaptiveCard } from '@/responsive/components/ui';
import { PlatformButton } from '@/components/ui/platform-button';
import { AdaptiveScrollArea } from '@/responsive/components/ui';
import { PlatformSpecific, IOSOnly, AndroidOnly, WebOnly } from '@/responsive/components/ui';
import { SafeAreaView } from '@/responsive/components/ui';

// Demo schema for the form
const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters')
});

// Sample data for the list
const sampleItems = [
  { id: '1', title: 'First item', subtitle: 'Description for first item', icon: Home },
  { id: '2', title: 'Second item', subtitle: 'Description for second item', icon: MessageCircle },
  { id: '3', title: 'Third item', subtitle: 'Description for third item', icon: User },
  { id: '4', title: 'Fourth item', subtitle: 'Description for fourth item', icon: Settings },
  { id: '5', title: 'Fifth item', subtitle: 'Description for fifth item', icon: MapPin },
];

// Sample tabs for the TabBar
const sampleTabs = [
  { id: 'home', label: 'Home', icon: Home, content: <div className="p-4">Home Tab Content</div> },
  { id: 'messages', label: 'Messages', icon: MessageCircle, content: <div className="p-4">Messages Tab Content</div>, badgeCount: 3 },
  { id: 'profile', label: 'Profile', icon: User, content: <div className="p-4">Profile Tab Content</div> },
  { id: 'settings', label: 'Settings', icon: Settings, content: <div className="p-4">Settings Tab Content</div> },
];

const PlatformComponentsDemo = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTabKey, setSelectedTabKey] = useState('home');
  const { isPlatformIOS, isPlatformAndroid } = useResponsive();
  
  const platformText = isPlatformIOS ? 'iOS' : isPlatformAndroid ? 'Android' : 'Web';

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      message: ''
    }
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    console.log('Form submitted:', data);
    hapticFeedback.success();
    alert(JSON.stringify(data, null, 2));
  };

  const handleItemClick = (id: string) => {
    console.log(`Item ${id} clicked`);
    hapticFeedback.selection();
  };
  
  const handleTabChange = (value: string) => {
    setSelectedTabKey(value);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Platform UI Components</h1>
      <p className="text-lg mb-8">
        Adaptive components that match the look and feel of {platformText} platforms.
      </p>
      
      <Tabs defaultValue="form" className="w-full">
        <TabsList className="mb-6 grid grid-cols-5 w-full">
          <TabsTrigger value="form">Form</TabsTrigger>
          <TabsTrigger value="list">List</TabsTrigger>
          <TabsTrigger value="modal">Modal</TabsTrigger>
          <TabsTrigger value="tabs">Tabs</TabsTrigger>
          <TabsTrigger value="enhanced">Enhanced</TabsTrigger>
        </TabsList>
        
        <TabsContent value="form" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Platform Form</CardTitle>
            </CardHeader>
            <CardContent>
              <PlatformForm
                onSubmit={onSubmit}
                schema={formSchema}
                submitText="Submit Form"
                resetText="Clear Form"
                showReset={true}
              >
                <PlatformInput 
                  name="name" 
                  control={form.control} 
                  label="Name" 
                  placeholder="Your name"
                />
                <PlatformInput 
                  name="email" 
                  control={form.control} 
                  label="Email" 
                  placeholder="your.email@example.com"
                />
                <PlatformInput 
                  name="phone" 
                  control={form.control} 
                  label="Phone (optional)" 
                  placeholder="Your phone number"
                />
                <PlatformInput 
                  name="message" 
                  control={form.control} 
                  label="Message" 
                  placeholder="Your message here"
                  description="Tell us what you need help with"
                />
              </PlatformForm>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="list" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Platform List</CardTitle>
            </CardHeader>
            <CardContent>
              <PlatformList className="h-[400px]">
                {sampleItems.map((item) => (
                  <PlatformListItem 
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    leading={<item.icon className="text-primary" />}
                    trailing={<ChevronRight className="text-muted-foreground" />}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{item.title}</span>
                      <span className="text-sm text-muted-foreground">{item.subtitle}</span>
                    </div>
                  </PlatformListItem>
                ))}
              </PlatformList>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="modal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Platform Modal</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-6">
              <Button onClick={() => setIsModalOpen(true)}>
                Open Platform Modal
              </Button>
              
              <PlatformModal
                title="Platform Modal Example"
                description="This modal adapts to iOS, Android or Web platforms automatically."
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                confirmText="Confirm"
                cancelText="Cancel"
                onConfirm={() => {
                  console.log('Confirmed');
                  setIsModalOpen(false);
                }}
                onCancel={() => {
                  console.log('Cancelled');
                  setIsModalOpen(false);
                }}
              >
                <div className="py-4">
                  <p>This is the content of the modal. It can contain anything you want.</p>
                </div>
              </PlatformModal>
              
              <Button 
                variant="outline" 
                onClick={() => setIsDialogOpen(true)}
                className="mt-4"
              >
                Open Platform Dialog
              </Button>
              
              <PlatformAwareDialog
                title="Platform Dialog"
                description="This dialog adapts to the current platform"
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                onConfirm={() => {
                  console.log('Dialog confirmed');
                  setIsDialogOpen(false);
                }}
              >
                <p>This demonstrates our new PlatformAwareDialog component.</p>
              </PlatformAwareDialog>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tabs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Platform Tab Bar</CardTitle>
            </CardHeader>
            <CardContent className="pb-0">
              <div className="h-[400px] border rounded-lg overflow-hidden">
                <PlatformTabBar 
                  tabs={sampleTabs}
                  value={selectedTabKey}
                  onChange={handleTabChange}
                  position="bottom"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="enhanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Enhanced Components</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Enhanced Haptic Button</h3>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      className="haptic-enabled"
                      onClick={() => hapticFeedback.light()}
                    >
                      Light
                    </Button>
                    <Button 
                      className="haptic-enabled"
                      onClick={() => hapticFeedback.medium()}
                    >
                      Medium
                    </Button>
                    <Button 
                      className="haptic-enabled"
                      onClick={() => hapticFeedback.heavy()}
                    >
                      Heavy
                    </Button>
                    <Button 
                      className="haptic-enabled"
                      onClick={() => hapticFeedback.success()}
                      variant="default"
                    >
                      Success
                    </Button>
                    <Button 
                      className="haptic-enabled"
                      onClick={() => hapticFeedback.error()}
                      variant="destructive"
                    >
                      Error
                    </Button>
                    <Button 
                      className="haptic-enabled"
                      onClick={() => hapticFeedback.warning()}
                      variant="outline"
                    >
                      Warning
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Adaptive Card</h3>
                  <AdaptiveCard 
                    title="Platform Card"
                    description="This card adapts to the current platform style."
                    footer={
                      <Button size="sm" className="w-full">
                        <Check className="mr-1 h-4 w-4" /> Action
                      </Button>
                    }
                  >
                    <p>Content goes here</p>
                  </AdaptiveCard>
                </div>
                
                <div className="space-y-4 md:col-span-2">
                  <h3 className="text-lg font-medium">Adaptive Scroll Area</h3>
                  <AdaptiveScrollArea className="h-[200px] border rounded-md p-4">
                    {Array(20).fill(0).map((_, i) => (
                      <p key={i} className="mb-4">Scrollable content item {i + 1}</p>
                    ))}
                  </AdaptiveScrollArea>
                </div>
                
                <div className="space-y-4 md:col-span-2">
                  <h3 className="text-lg font-medium">Platform Button Examples</h3>
                  <div className="flex flex-wrap gap-4">
                    <PlatformButton>Default</PlatformButton>
                    <PlatformButton variant="outline">Outline</PlatformButton>
                    <PlatformButton variant="destructive">Destructive</PlatformButton>
                    <PlatformButton variant="secondary">Secondary</PlatformButton>
                    <PlatformButton hapticFeedbackType="success" variant="default">
                      With Success Feedback
                    </PlatformButton>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PlatformComponentsDemo;
