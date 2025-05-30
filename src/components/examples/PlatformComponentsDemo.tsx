import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Home, MessageCircle } from 'lucide-react';
import { hapticFeedback } from '@/utils/hapticFeedback';
import { useResponsive } from '@/responsive/core';
import { 
  PlatformForm, 
  PlatformInput,
  PlatformList,
  PlatformListItem,
  PlatformModal,
  PlatformTabBar,
  PlatformAwareDialog
} from '@/components/ui/platform-components';

const PlatformComponentsDemo = () => {
  const { isPlatformIOS, isPlatformAndroid, isMobile } = useResponsive();
  const [showModal, setShowModal] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  // Form schema for demo
  const formSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    message: z.string().min(5, 'Message must be at least 5 characters'),
    category: z.string().nonempty('Please select a category'),
  });

  // Tab items for the tab bar demo
  const tabItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'messages', label: 'Messages', icon: MessageCircle, badgeCount: 3 },
  ];

  // List items for demo
  const listItems = [
    { id: '1', title: 'First Item', subtitle: 'This is the first item', icon: Home },
    { id: '2', title: 'Second Item', subtitle: 'This is the second item', icon: MessageCircle },
  ];

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      message: '',
      category: '',
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    console.log('Form submitted:', data);
    
    hapticFeedback.success();
  };

  const handleButtonPress = () => {
    hapticFeedback.impact('medium');
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Platform Components Demo</h1>
      
      <p className="mb-6 text-gray-600 dark:text-gray-400">
        Current platform: {isPlatformIOS ? 'iOS' : isPlatformAndroid ? 'Android' : 'Web'} 
        {isMobile && ' (Mobile)'}
      </p>

      <Tabs defaultValue="forms">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="forms">Forms</TabsTrigger>
          <TabsTrigger value="lists">Lists</TabsTrigger>
          <TabsTrigger value="modals">Modals</TabsTrigger>
          <TabsTrigger value="dialogs">Dialogs</TabsTrigger>
          <TabsTrigger value="tabs">Tab Bars</TabsTrigger>
        </TabsList>
        
        <TabsContent value="forms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Platform-Adaptive Form</CardTitle>
            </CardHeader>
            <CardContent>
              <PlatformForm
                schema={formSchema}
                onSubmit={onSubmit}
                submitText="Submit Form"
                showReset={true}
              >
                <PlatformInput
                  name="name"
                  label="Name"
                  placeholder="Enter your name"
                />
                <PlatformInput
                  name="email"
                  label="Email"
                  type="email"
                  placeholder="Enter your email"
                />
                <PlatformInput
                  name="message"
                  label="Message"
                  type="textarea"
                  placeholder="Enter your message"
                />
                <PlatformInput
                  name="category"
                  label="Category"
                  placeholder="Select a category"
                />
              </PlatformForm>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="lists" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Platform-Adaptive List</CardTitle>
            </CardHeader>
            <CardContent>
              <PlatformList header="Demo Items">
                {listItems.map((item) => (
                  <PlatformListItem
                    key={item.id}
                    leading={<item.icon className="h-5 w-5" />}
                    onClick={() => console.log(`Clicked ${item.title}`)}
                  >
                    <div>
                      <div className="font-medium">{item.title}</div>
                      <div className="text-sm text-gray-500">{item.subtitle}</div>
                    </div>
                  </PlatformListItem>
                ))}
              </PlatformList>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="modals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Platform-Adaptive Modal</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setShowModal(true)} className="w-full">
                Open Modal
              </Button>
              
              <PlatformModal
                open={showModal}
                onOpenChange={setShowModal}
                title="Demo Modal"
                description="This modal adapts to your platform"
                confirmText="Confirm"
                cancelText="Cancel"
                onConfirm={() => {
                  console.log('Modal confirmed');
                  setShowModal(false);
                }}
                onCancel={() => setShowModal(false)}
              >
                <p>This is the modal content. The styling and behavior will adapt based on your platform.</p>
              </PlatformModal>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="dialogs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Platform-Aware Dialog</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setShowDialog(true)} className="w-full">
                Open Dialog
              </Button>
              
              <PlatformAwareDialog
                open={showDialog}
                onOpenChange={setShowDialog}
                title="Demo Dialog"
                description="This dialog follows platform conventions"
                confirmText="OK"
                cancelText="Cancel"
                onConfirm={() => console.log('Dialog confirmed')}
                onCancel={() => console.log('Dialog cancelled')}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tabs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Platform Tab Bar</CardTitle>
            </CardHeader>
            <CardContent>
              <PlatformTabBar
                tabs={tabItems.map(item => ({
                  ...item,
                  content: (
                    <div className="p-4">
                      <h3 className="text-lg font-medium mb-2">{item.label}</h3>
                      <p>This is the content for the {item.label.toLowerCase()} tab.</p>
                    </div>
                  )
                }))}
                defaultValue="home"
                variant="default"
                showIcons={true}
                showLabels={true}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PlatformComponentsDemo;
