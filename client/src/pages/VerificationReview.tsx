import React from 'react';
import { CheckIcon, XIcon } from 'lucide-react';
interface VerificationItem {
  id: string;
  userName: string;
  livePhoto: string;
  profilePhoto: string;
  submittedDate: string;
}
const mockVerifications: VerificationItem[] = [
{
  id: '1',
  userName: 'Sarah Johnson',
  livePhoto:
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
  profilePhoto:
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
  submittedDate: '2024-03-15'
},
{
  id: '2',
  userName: 'Mike Chen',
  livePhoto:
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
  profilePhoto:
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
  submittedDate: '2024-03-15'
},
{
  id: '3',
  userName: 'Emma Davis',
  livePhoto:
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
  profilePhoto:
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
  submittedDate: '2024-03-14'
},
{
  id: '4',
  userName: 'James Wilson',
  livePhoto:
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400',
  profilePhoto:
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400',
  submittedDate: '2024-03-14'
},
{
  id: '5',
  userName: 'Lisa Anderson',
  livePhoto:
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
  profilePhoto:
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
  submittedDate: '2024-03-13'
}];

export function VerificationReview() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Verification Review
        </h1>
      </div>

      <div className="space-y-6">
        {mockVerifications.map((item) =>
        <div key={item.id} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {item.userName}
                </h3>
                <p className="text-sm text-gray-600">
                  Submitted: {item.submittedDate}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm font-semibold text-gray-700 mb-3">
                  Live Face Verification
                </div>
                <div className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                  <img
                  src={item.livePhoto}
                  alt="Live verification"
                  className="w-full h-full object-cover" />
                
                </div>
              </div>

              <div>
                <div className="text-sm font-semibold text-gray-700 mb-3">
                  Main Profile Photo
                </div>
                <div className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                  <img
                  src={item.profilePhoto}
                  alt="Profile photo"
                  className="w-full h-full object-cover" />
                
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button className="flex-1 bg-green-500 text-white py-3 px-6 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2 font-semibold">
                <CheckIcon size={20} />
                Verify
              </button>
              <button className="flex-1 bg-red-500 text-white py-3 px-6 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2 font-semibold">
                <XIcon size={20} />
                Reject / Request Re-verify
              </button>
            </div>
          </div>
        )}
      </div>
    </div>);

}