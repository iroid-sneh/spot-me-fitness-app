import React, { useState } from 'react';
interface ProgressItem {
  id: string;
  userName: string;
  avatar: string;
  thumbnail: string;
  timestamp: string;
  workoutType: string;
  badgeGranted: boolean;
}
const mockProgress: ProgressItem[] = [
{
  id: '1',
  userName: 'Sarah Johnson',
  avatar: 'SJ',
  thumbnail:
  'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400',
  timestamp: 'March 2024',
  workoutType: 'Strength Training',
  badgeGranted: true
},
{
  id: '2',
  userName: 'Mike Chen',
  avatar: 'MC',
  thumbnail:
  'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400',
  timestamp: 'March 2024',
  workoutType: 'Bodybuilding',
  badgeGranted: true
},
{
  id: '3',
  userName: 'Emma Davis',
  avatar: 'ED',
  thumbnail:
  'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400',
  timestamp: 'February 2024',
  workoutType: 'Cardio',
  badgeGranted: false
},
{
  id: '4',
  userName: 'James Wilson',
  avatar: 'JW',
  thumbnail:
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
  timestamp: 'March 2024',
  workoutType: 'CrossFit',
  badgeGranted: true
},
{
  id: '5',
  userName: 'Lisa Anderson',
  avatar: 'LA',
  thumbnail:
  'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400',
  timestamp: 'February 2024',
  workoutType: 'Yoga',
  badgeGranted: false
},
{
  id: '6',
  userName: 'David Martinez',
  avatar: 'DM',
  thumbnail:
  'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=400',
  timestamp: 'March 2024',
  workoutType: 'HIIT',
  badgeGranted: true
}];

export function ProgressCapture() {
  const [items, setItems] = useState(mockProgress);
  const toggleBadge = (id: string) => {
    setItems(
      items.map((item) =>
      item.id === id ?
      {
        ...item,
        badgeGranted: !item.badgeGranted
      } :
      item
      )
    );
  };
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Progress Capture Review
        </h1>
        <p className="text-gray-600 mt-1">
          Review in-app only captures and grant Active Fitness Verified Badge
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="space-y-4">
          {items.map((item) =>
          <div
            key={item.id}
            className="flex items-center gap-6 p-4 border border-gray-200 rounded-lg hover:border-primary/50 transition-colors">
            
              <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center font-semibold text-lg">
                {item.avatar}
              </div>

              <div className="flex-1">
                <div className="font-semibold text-gray-900">
                  {item.userName}
                </div>
                <div className="text-sm text-gray-600">{item.timestamp}</div>
              </div>

              <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100">
                <img
                src={item.thumbnail}
                alt="Progress capture"
                className="w-full h-full object-cover" />
              
              </div>

              <div className="w-40">
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  {item.workoutType}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-700 font-medium">
                  Active Fitness Badge
                </span>
                <button
                onClick={() => toggleBadge(item.id)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${item.badgeGranted ? 'bg-primary' : 'bg-gray-300'}`}>
                
                  <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${item.badgeGranted ? 'translate-x-6' : 'translate-x-1'}`} />
                
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>);

}