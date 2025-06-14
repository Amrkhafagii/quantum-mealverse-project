import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { UserMeasurement } from '@/types/fitness';
import { toast } from 'sonner';

interface MeasurementFormProps {
  userId?: string;
  onMeasurementAdded?: () => void;
}

const MeasurementForm: React.FC<MeasurementFormProps> = ({ userId, onMeasurementAdded }) => {
  const { user } = useAuth();
  const activeUserId = userId || user?.id;

  const initialFormData = {
    date: new Date().toISOString().split('T')[0],
    weight: '',
    body_fat: '',
    chest: '',
    waist: '',
    hips: '',
    arms: '',
    legs: '',
    notes: '',
  };

  const [formData, setFormData] = useState(initialFormData);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (data: typeof formData) => {
    if (!activeUserId) {
      toast.error('User not found.');
      return;
    }

    try {
      setSubmitting(true);
      const { data: inserted, error } = await supabase
        .from('user_measurements')
        .insert({
          user_measurements_user_id: activeUserId,
          date: data.date,
          weight: Number(data.weight),
          body_fat: data.body_fat ? Number(data.body_fat) : undefined,
          chest: data.chest ? Number(data.chest) : undefined,
          waist: data.waist ? Number(data.waist) : undefined,
          hips: data.hips ? Number(data.hips) : undefined,
          arms: data.arms ? Number(data.arms) : undefined,
          legs: data.legs ? Number(data.legs) : undefined,
          notes: data.notes,
        })
        .select();

      if (error) throw error;

      toast.success('Measurement saved successfully!');
      setFormData(initialFormData);

      if (typeof onMeasurementAdded === "function") {
        onMeasurementAdded();
      }
    } catch (error) {
      console.error('Error saving measurement:', error);
      toast.error('Failed to save measurement');
    } finally {
      setSubmitting(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(formData);
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
          min="0"
          step="any"
          required
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
          min="0"
          max="100"
          step="any"
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
          min="0"
          step="any"
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
          min="0"
          step="any"
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
          min="0"
          step="any"
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
          min="0"
          step="any"
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
          min="0"
          step="any"
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
          className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${submitting ? 'opacity-60 cursor-not-allowed' : ''}`}
          type="submit"
          disabled={submitting}
        >
          {submitting ? "Saving..." : "Save Measurement"}
        </button>
      </div>
    </form>
  );
};

export default MeasurementForm;

// NOTE: This file has reached 233+ lines and may be getting too long and difficult to maintain. 
// Consider asking me to refactor it into smaller components!
