
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Settings, Home, MessageSquare, Calendar, Check } from 'lucide-react';
import { MobileContainer } from '@/components/mobile/MobileContainer';

import {
  PlatformForm,
  PlatformInput,
  PlatformList,
  PlatformListItem,
  PlatformModal,
  PlatformTabBar,
  PlatformButton
} from '@/components/ui/platform-components';

import { Button } from '@/components/ui/button';
import { useResponsive } from '@/contexts/ResponsiveContext';

export function PlatformComponentsDemo() {
  const { isPlatformIOS, isPlatformAndroid } = useResponsive();
  const [activeTab, setActiveTab] = useState('form');
  const [modalOpen, setModalOpen] = useState(false);
  const [listItems, setListItems] = useState([
    { id: '1', title: 'Item 1', description: 'Description for item 1' },
    { id: '2', title: 'Item 2', description: 'Description for item 2' },
    { id: '3', title: 'Item 3', description: 'Description for item 3' }
  ]);
  
  // Form schema for validation
  const formSchema = z.object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
    email: z.string().email({ message: 'Please enter a valid email' }),
  });
  
  const form = useForm({
    defaultValues: {
      name: '',
      email: ''
    }
  });
  
  const onSubmitForm = (data: any) => {
    console.log('Form submitted:', data);
    alert(`Form submitted: ${JSON.stringify(data, null, 2)}`);
  };
  
  // Tabs for the TabBar demo
  const tabs = [
    { 
      id: 'home', 
      label: 'Home', 
      icon: Home,
      content: (
        <div className="p-4 h-40 flex items-center justify-center">
          <p>Home Content</p>
        </div>
      ) 
    },
    { 
      id: 'messages', 
      label: 'Messages', 
      icon: MessageSquare,
      badgeCount: 3,
      content: (
        <div className="p-4 h-40 flex items-center justify-center">
          <p>Messages Content</p>
        </div>
      ) 
    },
    { 
      id: 'calendar', 
      label: 'Calendar', 
      icon: Calendar,
      content: (
        <div className="p-4 h-40 flex items-center justify-center">
          <p>Calendar Content</p>
        </div>
      ) 
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: Settings,
      content: (
        <div className="p-4 h-40 flex items-center justify-center">
          <p>Settings Content</p>
        </div>
      ) 
    }
  ];
  
  // Add a new list item
  const addListItem = () => {
    const newItem = {
      id: Math.random().toString(36).substring(7),
      title: `Item ${listItems.length + 1}`,
      description: `Description for item ${listItems.length + 1}`
    };
    setListItems([...listItems, newItem]);
  };
  
  // Remove a list item
  const removeListItem = (id: string) => {
    setListItems(listItems.filter(item => item.id !== id));
  };
  
  // Refresh list handler
  const handleRefresh = async () => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        // Reset the list
        setListItems([
          { id: '1', title: 'Refreshed Item 1', description: 'Description for refreshed item 1' },
          { id: '2', title: 'Refreshed Item 2', description: 'Description for refreshed item 2' },
        ]);
        resolve();
      }, 1500);
    });
  };

  return (
    <MobileContainer fullHeight>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Platform UI Components</CardTitle>
          <CardDescription>
            Adaptive components that follow platform-specific design patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="form">Form</TabsTrigger>
              <TabsTrigger value="list">List</TabsTrigger>
              <TabsTrigger value="modal">Modal</TabsTrigger>
              <TabsTrigger value="tabs">Tabs</TabsTrigger>
            </TabsList>
            
            <TabsContent value="form" className="space-y-4">
              <h3 className="text-lg font-medium">Platform Form</h3>
              <p className="text-sm text-muted-foreground">Forms with platform-specific styling and validation</p>
              
              <div className="border rounded-md p-4 mt-4">
                <PlatformForm
                  schema={formSchema}
                  onSubmit={onSubmitForm}
                  submitText={isPlatformIOS ? "Submit Form" : "Submit"}
                  showReset
                >
                  <PlatformInput
                    name="name"
                    control={form.control}
                    label="Full Name"
                    placeholder="Enter your name"
                  />
                  <PlatformInput
                    name="email"
                    control={form.control}
                    label="Email Address"
                    placeholder="Enter your email"
                    type="email"
                  />
                </PlatformForm>
              </div>
            </TabsContent>
            
            <TabsContent value="list" className="space-y-4">
              <h3 className="text-lg font-medium">Platform List</h3>
              <p className="text-sm text-muted-foreground">Lists with platform-specific styling and interactions</p>
              
              <div className="border rounded-md mt-4">
                <PlatformList
                  scrollable
                  maxHeight="200px"
                  pullToRefresh
                  onRefresh={handleRefresh}
                >
                  {listItems.map(item => (
                    <PlatformListItem
                      key={item.id}
                      leading={<div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center"><User size={16} /></div>}
                      trailing={
                        <PlatformButton 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => removeListItem(item.id)}
                          className="h-7 w-7 p-0" 
                          aria-label="Remove item"
                        >
                          <Check size={16} />
                        </PlatformButton>
                      }
                    >
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </PlatformListItem>
                  ))}
                </PlatformList>
              </div>
              
              <div className="flex justify-center mt-4">
                <Button onClick={addListItem}>Add Item</Button>
              </div>
            </TabsContent>
            
            <TabsContent value="modal" className="space-y-4">
              <h3 className="text-lg font-medium">Platform Modal</h3>
              <p className="text-sm text-muted-foreground">Modals with platform-specific styling and animations</p>
              
              <div className="border rounded-md p-4 mt-4 flex flex-col items-center justify-center">
                <Button onClick={() => setModalOpen(true)}>Open Modal</Button>
                
                <PlatformModal
                  open={modalOpen}
                  onOpenChange={setModalOpen}
                  title="Platform Modal Example"
                  description="This modal adapts to the current platform's design language"
                  onConfirm={() => setModalOpen(false)}
                  onCancel={() => setModalOpen(false)}
                >
                  <div className="py-4">
                    <p>Modal content goes here. This modal's appearance and behavior changes based on the platform.</p>
                  </div>
                </PlatformModal>
              </div>
            </TabsContent>
            
            <TabsContent value="tabs" className="space-y-4">
              <h3 className="text-lg font-medium">Platform Tab Bar</h3>
              <p className="text-sm text-muted-foreground">Tab navigation with platform-specific styling</p>
              
              <div className="border rounded-md mt-4">
                <div className="h-64">
                  <PlatformTabBar
                    tabs={tabs}
                    position="top"
                    variant={isPlatformIOS ? "segmented" : "default"}
                  />
                </div>
                
                <div className="h-64 mt-6">
                  <PlatformTabBar
                    tabs={tabs}
                    position="bottom"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <p className="text-sm text-muted-foreground">
            Current Platform: {isPlatformIOS ? 'iOS' : isPlatformAndroid ? 'Android' : 'Web'}
          </p>
        </CardFooter>
      </Card>
    </MobileContainer>
  );
}

export default PlatformComponentsDemo;
