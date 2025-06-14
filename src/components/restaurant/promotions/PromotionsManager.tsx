import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useRestaurantAuth } from '@/hooks/useRestaurantAuth';
// Remove local PromotionType declaration (fix TS2440) and ensure proper import:
import { PromotionType, RestaurantPromotion } from '@/types/notifications';
import { promotionService } from '@/services/promotions/promotionService';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Edit, Trash2, Plus, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from "@/components/ui/switch"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
// Remove broken dialog imports:
// import { CreatePromotionDialog } from './CreatePromotionDialog';
// import { UpdatePromotionDialog } from './UpdatePromotionDialog';

export const PromotionsManager: React.FC = () => {
  const { restaurant } = useRestaurantAuth();
  const [promotions, setPromotions] = useState<RestaurantPromotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<RestaurantPromotion | null>(null);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);

  useEffect(() => {
    if (!restaurant?.id) return;
    setLoading(true);
    promotionService
      .getAllPromotions(restaurant.id) // <-- TS2339 FIX: use correct method
      .then((items) => {
        setPromotions(items);
      })
      .catch((err) => {
        setLoading(false);
        toast.error('Failed to load promotions');
      })
      .finally(() => setLoading(false));
  }, [restaurant?.id]);

  const handlePromotionToggle = async (promotionId: string, isActive: boolean) => {
    try {
      await promotionService.togglePromotionStatus(promotionId, !isActive);
      setPromotions(promotions.map(promotion =>
        promotion.id === promotionId ? { ...promotion, is_active: !isActive } : promotion
      ));
      toast.success(`Promotion ${isActive ? 'deactivated' : 'activated'} successfully`);
    } catch (error: any) {
      toast.error(`Failed to toggle promotion status: ${error.message}`);
    }
  };

  const handleDeletePromotion = async (promotionId: string) => {
    try {
      await promotionService.deletePromotion(promotionId);
      setPromotions(promotions.filter(promotion => promotion.id !== promotionId));
      toast.success('Promotion deleted successfully');
    } catch (error: any) {
      toast.error(`Failed to delete promotion: ${error.message}`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Promotions Management</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Loading promotions...</p>
        ) : (
          <>
            {/* The "Create New Promotion" button can remain but disables the dialog */}
            <div className="mb-4">
              <Button /*onClick={() => setOpenCreateDialog(true)}*/ disabled>
                <Plus className="mr-2 h-4 w-4" />
                Create New Promotion (dialog unavailable)
              </Button>
            </div>
            {promotions.length === 0 ? (
              <p>No promotions found. Create one to get started!</p>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Discount</TableHead>
                      <TableHead>Promo Code</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {promotions.map((promotion) => (
                      <TableRow key={promotion.id}>
                        <TableCell className="font-medium">{promotion.name}</TableCell>
                        <TableCell>{promotion.promotion_type}</TableCell>
                        <TableCell>
                          {promotion.promotion_type === 'discount' ? `${promotion.discount_value}%` : 'N/A'}
                        </TableCell>
                        <TableCell>{promotion.promo_code}</TableCell>
                        <TableCell>
                          <Badge variant={promotion.is_active ? 'default' : 'secondary'}>
                            {promotion.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Switch
                            checked={promotion.is_active}
                            onCheckedChange={() => handlePromotionToggle(promotion.id, promotion.is_active)}
                            className="mr-2"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // setSelectedPromotion(promotion);
                              // setOpenUpdateDialog(true);
                            }}
                            disabled
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the promotion and remove its data from our servers.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeletePromotion(promotion.id)}>
                                  Continue
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </>
        )}
      </CardContent>
      {/* Disabled dialogs below because files are missing */}
      {/* <CreatePromotionDialog open={openCreateDialog} setOpen={setOpenCreateDialog} setPromotions={setPromotions} restaurantId={restaurant?.id || ''} /> */}
      {/* <UpdatePromotionDialog open={openUpdateDialog} setOpen={setOpenUpdateDialog} setPromotions={setPromotions} promotion={selectedPromotion} /> */}
    </Card>
  );
};
