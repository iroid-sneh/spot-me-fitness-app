import React, { useState } from 'react';
import { CheckIcon, XIcon } from 'lucide-react';
type MediaType = 'photos' | 'videos' | 'fitness';
interface MediaItem {
  id: string;
  userName: string;
  type: MediaType;
  thumbnail: string;
}
const mockMedia: MediaItem[] = [
{
  id: '1',
  userName: 'Sarah Johnson',
  type: 'photos',
  thumbnail:
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400'
},
{
  id: '2',
  userName: 'Mike Chen',
  type: 'photos',
  thumbnail:
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'
},
{
  id: '3',
  userName: 'Emma Davis',
  type: 'videos',
  thumbnail:
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400'
},
{
  id: '4',
  userName: 'James Wilson',
  type: 'fitness',
  thumbnail:
  'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400'
},
{
  id: '5',
  userName: 'Lisa Anderson',
  type: 'photos',
  thumbnail:
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'
},
{
  id: '6',
  userName: 'David Martinez',
  type: 'videos',
  thumbnail:
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400'
},
{
  id: '7',
  userName: 'Rachel Kim',
  type: 'fitness',
  thumbnail:
  'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400'
},
{
  id: '8',
  userName: 'Tom Brown',
  type: 'photos',
  thumbnail:
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400'
},
{
  id: '9',
  userName: 'Amy White',
  type: 'fitness',
  thumbnail:
  'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400'
},
{
  id: '10',
  userName: 'Chris Lee',
  type: 'videos',
  thumbnail:
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400'
}];

export function ModerationQueue() {
  const [activeTab, setActiveTab] = useState<MediaType>('photos');
  const filteredMedia = mockMedia.filter((item) => {
    if (activeTab === 'photos') return item.type === 'photos';
    if (activeTab === 'videos') return item.type === 'videos';
    if (activeTab === 'fitness') return item.type === 'fitness';
    return true;
  });
  const tabs = [
  {
    id: 'photos' as MediaType,
    label: 'Main Profile Photos'
  },
  {
    id: 'videos' as MediaType,
    label: 'Short Videos (7s)'
  },
  {
    id: 'fitness' as MediaType,
    label: 'Fitness Requirement Media'
  }];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Moderation Queue</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex gap-2 mb-8 border-b border-gray-200">
          {tabs.map((tab) =>
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 font-medium transition-colors relative ${activeTab === tab.id ? 'text-primary' : 'text-gray-600 hover:text-gray-900'}`}>
            
              {tab.label}
              {activeTab === tab.id &&
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            }
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMedia.map((item) =>
          <div key={item.id} className="group relative">
              <div className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                <img
                src={item.thumbnail}
                alt={item.userName}
                className="w-full h-full object-cover" />
              
              </div>
              <div className="mt-3 mb-3">
                <div className="font-medium text-gray-900">{item.userName}</div>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2">
                  <CheckIcon size={18} />
                  Approve
                </button>
                <button className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2">
                  <XIcon size={18} />
                  Reject
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>);

}