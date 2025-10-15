import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Star } from 'lucide-react';
import { useAuth } from './context/AuthContext';

const ReviewForm = ({ courseId, onReviewSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [existingRating, setExistingRating] = useState(null);
  const { token, user, isAuthenticated } = useAuth();

  const API_BASE = "http://localhost:3000";

  // Fetch existing rating when component mounts
  useEffect(() => {
    const fetchExistingRating = async () => {
      if (!isAuthenticated || !token || !courseId) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/rating/course/${courseId}/user`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const ratingData = await response.json();
          if (ratingData) {
            setExistingRating(ratingData);
            setRating(ratingData.value);
            setComment(ratingData.comment || '');
          }
        }
      } catch (err) {
        console.error('Error fetching existing rating:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExistingRating();
  }, [courseId, token, isAuthenticated]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (!isAuthenticated || !token) {
      setError('Please log in to rate this course');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      
      const response = await fetch(`${API_BASE}/rating/course/${courseId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          value: rating,
          comment: comment.trim() || undefined
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit review');
      }

      const responseData = await response.json();
      
      // Update existing rating state
      setExistingRating(responseData);
      setError('');
      
      // Notify parent component
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Don't show the form if user is not authenticated
  if (!isAuthenticated) {
    return (
      <Card className="mb-6">
        <CardContent className="pt-6">
          <p className="text-center text-gray-600">
            Please log in to rate this course.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardContent className="pt-6">
          <p className="text-center text-gray-600">
            Loading...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>
          {existingRating ? 'Update Your Rating' : 'Rate this Course'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Rating</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="focus:outline-none"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                >
                  <Star
                    className={`w-6 h-6 transition-colors ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300 hover:text-yellow-300'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-600">
                {rating > 0 && `${rating} star${rating > 1 ? 's' : ''}`}
              </span>
            </div>
          </div>


          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={isSubmitting || rating === 0}
            className="w-full"
          >
            {isSubmitting 
              ? 'Submitting...' 
              : existingRating 
                ? 'Update Rating' 
                : 'Submit Rating'
            }
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ReviewForm;
