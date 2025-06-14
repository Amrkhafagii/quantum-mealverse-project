import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { UserMeasurement } from '@/types/fitness';
import { toast } from 'sonner';

const MeasurementForm = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    weight: '',
    body_fat: '',
    chest: '',
    waist: '',
    hips: '',
    arms: '',
    legs: '',
    notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (formData: any) => {
    try {
      const { data, error } = await supabase
        .from('user_measurements')
        .insert({
          user_measurements_user_id: user.id, // Updated field name
          date: formData.date,
          weight: formData.weight,
          body_fat: formData.body_fat,
          chest: formData.chest,
          waist: formData.waist,
          hips: formData.hips,
          arms: formData.arms,
          legs: formData.legs,
          notes: formData.notes,
        });

      if (error) throw error;
      
      toast.success('Measurement saved successfully!');
      return data;
    } catch (error) {
      console.error('Error saving measurement:', error);
      toast.error('Failed to save measurement');
      throw error;
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await handleSubmit(formData);
      // Optionally reset the form after successful submission
      setFormData({
        date: new Date().toISOString().split('T')[0],
        weight: '',
        body_fat: '',
        chest: '',
        waist: '',
        hips: '',
        arms: '',
        legs: '',
        notes: '',
      });
    } catch (err) {
      // Error is already handled in handleSubmit
    }
  };

  return (
    <form onSubmit={onSubmit} className="max-w-md mx-auto mt-8">
      <div className="mb-4">
        <label htmlFor="date" className="block text-gray-700 text-sm font-bold mb-2">
          Date:
        </label>
        <input
          type="date"
          id="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="weight" className="block text-gray-700 text-sm font-bold mb-2">
          Weight (kg):
        </label>
        <input
          type="number"
          id="weight"
          name="weight"
          value={formData.weight}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="body_fat" className="block text-gray-700 text-sm font-bold mb-2">
          Body Fat (%):
        </label>
        <input
          type="number"
          id="body_fat"
          name="body_fat"
          value={formData.body_fat}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="chest" className="block text-gray-700 text-sm font-bold mb-2">
          Chest (cm):
        </label>
        <input
          type="number"
          id="chest"
          name="chest"
          value={formData.chest}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="waist" className="block text-gray-700 text-sm font-bold mb-2">
          Waist (cm):
        </label>
        <input
          type="number"
          id="waist"
          name="waist"
          value={formData.waist}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="hips" className="block text-gray-700 text-sm font-bold mb-2">
          Hips (cm):
        </label>
        <input
          type="number"
          id="hips"
          name="hips"
          value={formData.hips}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="arms" className="block text-gray-700 text-sm font-bold mb-2">
          Arms (cm):
        </label>
        <input
          type="number"
          id="arms"
          name="arms"
          value={formData.arms}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="legs" className="block text-gray-700 text-sm font-bold mb-2">
          Legs (cm):
        </label>
        <input
          type="number"
          id="legs"
          name="legs"
          value={formData.legs}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>

      <div className="mb-6">
        <label htmlFor="notes" className="block text-gray-700 text-sm font-bold mb-2">
          Notes:
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>

      <div className="flex items-center justify-between">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          type="submit"
        >
          Save Measurement
        </button>
      </div>
    </form>
  );
};

export default MeasurementForm;
