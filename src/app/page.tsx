import Link from 'next/link';
import { Typography } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';
import { User, Package, Pill, DollarSign } from 'lucide-react';
import { Header } from '@/components/ui/header';

const features = [
  {
    name: 'Patient Management',
    description: 'Efficiently manage patient records, appointments, and medical history.',
    icon: User,
  },
  {
    name: 'Inventory Control',
    description: 'Track and manage your medical supplies and equipment inventory.',
    icon: Package,
  },
  {
    name: 'Pharmacy Management',
    description: 'Streamline your pharmacy operations with our comprehensive system.',
    icon: Pill,
  },
  {
    name: 'Financial Management',
    description: 'Handle billing, payments, and financial reporting with ease.',
    icon: DollarSign,
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header variant="transparent" showAuth />

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <Typography variant="h1" className="text-4xl tracking-tight font-extrabold text-green-600 sm:text-5xl md:text-6xl">
                  <span className="block">'Agasthya'</span>
                  <span className="block text-primary-600">Traditional Cure</span>
                </Typography>
                <Typography variant="p" className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Streamline your healthcare operations with our comprehensive management system. 
                  From patient care to inventory management, we've got you covered.
                </Typography>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Link href="/auth/signin">
                      <Button size="lg" className="w-full">
                        Get Started
                      </Button>
                    </Link>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Link href="#features">
                      <Button variant="outline" size="lg" className="w-full">
                        Learn More
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <Typography variant="h2" className="text-base text-gray-900 font-semibold tracking-wide uppercase">
              Features
            </Typography>
            <Typography variant="h3" className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to manage your healthcare facility
            </Typography>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              {features.map((feature) => (
                <div key={feature.name} className="relative">
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                    <feature.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <div className="ml-16">
                    <Typography variant="h4" className="text-lg leading-6 font-medium text-gray-900">
                      {feature.name}
                    </Typography>
                    <Typography variant="p" className="mt-2 text-base text-gray-500">
                      {feature.description}
                    </Typography>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-50">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <Typography variant="h2" className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            <span className="block">Ready to get started?</span>
            <span className="block text-primary-600">Sign in to your account today.</span>
          </Typography>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link href="/auth/signin">
                <Button size="lg">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
