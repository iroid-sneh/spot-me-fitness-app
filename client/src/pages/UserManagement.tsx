import React, { useState } from 'react';
import { SearchIcon, EditIcon, XIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
interface User {
  id: string;
  name: string;
  email: string;
  status: 'Active' | 'Inactive';
  fitnessGoal: string;
  joinDate: string;
  avatar: string;
  workoutFrequency: string;
  trainingStyle: string;
  diet: string;
}
const mockUsers: User[] = [
{
  id: '1',
  name: 'Sarah Johnson',
  email: 'sarah.j@email.com',
  status: 'Active',
  fitnessGoal: 'Weight Loss',
  joinDate: '2024-01-15',
  avatar: 'SJ',
  workoutFrequency: '5x/week',
  trainingStyle: 'HIIT',
  diet: 'Balanced'
},
{
  id: '2',
  name: 'Mike Chen',
  email: 'mike.chen@email.com',
  status: 'Active',
  fitnessGoal: 'Muscle Gain',
  joinDate: '2024-02-03',
  avatar: 'MC',
  workoutFrequency: '6x/week',
  trainingStyle: 'Strength',
  diet: 'High Protein'
},
{
  id: '3',
  name: 'Emma Davis',
  email: 'emma.d@email.com',
  status: 'Active',
  fitnessGoal: 'Endurance',
  joinDate: '2024-01-28',
  avatar: 'ED',
  workoutFrequency: '4x/week',
  trainingStyle: 'Cardio',
  diet: 'Plant-based'
},
{
  id: '4',
  name: 'James Wilson',
  email: 'j.wilson@email.com',
  status: 'Inactive',
  fitnessGoal: 'General Fitness',
  joinDate: '2023-12-10',
  avatar: 'JW',
  workoutFrequency: '3x/week',
  trainingStyle: 'Mixed',
  diet: 'Flexible'
},
{
  id: '5',
  name: 'Lisa Anderson',
  email: 'lisa.a@email.com',
  status: 'Active',
  fitnessGoal: 'Flexibility',
  joinDate: '2024-02-20',
  avatar: 'LA',
  workoutFrequency: '5x/week',
  trainingStyle: 'Yoga',
  diet: 'Vegetarian'
},
{
  id: '6',
  name: 'David Martinez',
  email: 'd.martinez@email.com',
  status: 'Active',
  fitnessGoal: 'Weight Loss',
  joinDate: '2024-01-05',
  avatar: 'DM',
  workoutFrequency: '4x/week',
  trainingStyle: 'CrossFit',
  diet: 'Keto'
},
{
  id: '7',
  name: 'Rachel Kim',
  email: 'rachel.k@email.com',
  status: 'Active',
  fitnessGoal: 'Muscle Gain',
  joinDate: '2024-02-14',
  avatar: 'RK',
  workoutFrequency: '5x/week',
  trainingStyle: 'Bodybuilding',
  diet: 'High Protein'
},
{
  id: '8',
  name: 'Tom Brown',
  email: 'tom.b@email.com',
  status: 'Inactive',
  fitnessGoal: 'Endurance',
  joinDate: '2023-11-22',
  avatar: 'TB',
  workoutFrequency: '3x/week',
  trainingStyle: 'Running',
  diet: 'Balanced'
}];

export function UserManagement() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const filteredUsers = mockUsers.filter(
    (user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="mb-6">
          <div className="relative">
            <SearchIcon
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20} />
            
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
            
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Name
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Email
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Fitness Goal
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Join Date
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) =>
              <tr
                key={user.id}
                className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => setSelectedUser(user)}>
                
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
                        {user.avatar}
                      </div>
                      <span className="font-medium text-gray-900">
                        {user.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{user.email}</td>
                  <td className="py-3 px-4">
                    <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${user.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {user.fitnessGoal}
                  </td>
                  <td className="py-3 px-4 text-gray-600">{user.joinDate}</td>
                  <td className="py-3 px-4">
                    <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedUser(user);
                      setEditModalOpen(true);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    
                      <EditIcon size={18} className="text-gray-600" />
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {selectedUser && !editModalOpen &&
        <motion.div
          initial={{
            opacity: 0
          }}
          animate={{
            opacity: 1
          }}
          exit={{
            opacity: 0
          }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedUser(null)}>
          
            <motion.div
            initial={{
              scale: 0.9,
              opacity: 0
            }}
            animate={{
              scale: 1,
              opacity: 1
            }}
            exit={{
              scale: 0.9,
              opacity: 0
            }}
            className="bg-white rounded-xl p-8 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}>
            
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Fitness Identity
                </h2>
                <button
                onClick={() => setSelectedUser(null)}
                className="p-2 hover:bg-gray-100 rounded-lg">
                
                  <XIcon size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Name</div>
                  <div className="font-semibold text-gray-900">
                    {selectedUser.name}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">
                    Workout Frequency
                  </div>
                  <div className="font-semibold text-gray-900">
                    {selectedUser.workoutFrequency}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">
                    Training Style
                  </div>
                  <div className="font-semibold text-gray-900">
                    {selectedUser.trainingStyle}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Diet</div>
                  <div className="font-semibold text-gray-900">
                    {selectedUser.diet}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Fitness Goal</div>
                  <div className="font-semibold text-gray-900">
                    {selectedUser.fitnessGoal}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        }

        {editModalOpen && selectedUser &&
        <motion.div
          initial={{
            opacity: 0
          }}
          animate={{
            opacity: 1
          }}
          exit={{
            opacity: 0
          }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setEditModalOpen(false)}>
          
            <motion.div
            initial={{
              scale: 0.9,
              opacity: 0
            }}
            animate={{
              scale: 1,
              opacity: 1
            }}
            exit={{
              scale: 0.9,
              opacity: 0
            }}
            className="bg-white rounded-xl p-8 max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}>
            
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Edit User
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Make changes to the user from below.
                  </p>
                </div>
                <button
                onClick={() => setEditModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg">
                
                  <XIcon size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">
                    User Info
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        Name
                      </label>
                      <input
                      type="text"
                      defaultValue={selectedUser.name}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                    
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                      type="email"
                      defaultValue={selectedUser.email}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                    
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">
                    Status
                  </div>
                  <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <div className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">
                    Password
                  </div>
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                    Reset Password
                  </button>
                </div>
              </div>

              <button className="w-full mt-8 bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                Save
              </button>
            </motion.div>
          </motion.div>
        }
      </AnimatePresence>
    </div>);

}