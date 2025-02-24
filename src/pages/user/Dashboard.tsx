import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Layout, LogOut, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LandingPage {
  title: string;
  description: string;
  heroImage: string;
  ctaText: string;
  features: {
    title: string;
    description: string;
  }[];
}

const defaultLandingPage: LandingPage = {
  title: 'Welcome to My Landing Page',
  description: 'A beautiful and customizable landing page',
  heroImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c',
  ctaText: 'Get Started',
  features: [
    {
      title: 'Feature 1',
      description: 'Description for feature 1'
    },
    {
      title: 'Feature 2',
      description: 'Description for feature 2'
    }
  ]
};

export default function UserDashboard() {
  const { currentUser, signOut } = useAuth();
  const [landingPage, setLandingPage] = useState<LandingPage>(defaultLandingPage);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchLandingPage() {
      try {
        if (!currentUser) return;
        
        const docRef = doc(db, 'landingPages', currentUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setLandingPage(docSnap.data() as LandingPage);
        }
      } catch (error) {
        console.error('Error fetching landing page:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchLandingPage();
  }, [currentUser]);

  async function handleSave() {
    if (!currentUser) return;
    
    setSaving(true);
    try {
      const docRef = doc(db, 'landingPages', currentUser.uid);
      await updateDoc(docRef, landingPage);
    } catch (error) {
      console.error('Error saving landing page:', error);
    } finally {
      setSaving(false);
    }
  }

  function updateFeature(index: number, field: keyof typeof landingPage.features[0], value: string) {
    const newFeatures = [...landingPage.features];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    setLandingPage({ ...landingPage, features: newFeatures });
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Layout className="w-6 h-6 text-indigo-600" />
              <h1 className="ml-2 text-xl font-semibold text-gray-900">Landing Page Editor</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                onClick={signOut}
                variant="outline"
                className="flex items-center"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Page Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={landingPage.title}
                    onChange={(e) => setLandingPage({ ...landingPage, title: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    id="description"
                    rows={3}
                    value={landingPage.description}
                    onChange={(e) => setLandingPage({ ...landingPage, description: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="heroImage" className="block text-sm font-medium text-gray-700">
                    Hero Image URL
                  </label>
                  <input
                    type="text"
                    id="heroImage"
                    value={landingPage.heroImage}
                    onChange={(e) => setLandingPage({ ...landingPage, heroImage: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="ctaText" className="block text-sm font-medium text-gray-700">
                    Call to Action Text
                  </label>
                  <input
                    type="text"
                    id="ctaText"
                    value={landingPage.ctaText}
                    onChange={(e) => setLandingPage({ ...landingPage, ctaText: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Features</h2>
              <div className="space-y-4">
                {landingPage.features.map((feature, index) => (
                  <div key={index} className="border rounded-md p-4">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Feature Title
                        </label>
                        <input
                          type="text"
                          value={feature.title}
                          onChange={(e) => updateFeature(index, 'title', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Feature Description
                        </label>
                        <textarea
                          rows={2}
                          value={feature.description}
                          onChange={(e) => updateFeature(index, 'description', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}