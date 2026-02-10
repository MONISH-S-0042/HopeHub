import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  AlertTriangle,
  HeartHandshake,
  MapPin,
  Shield,
  Users,
  Building2,
  ArrowRight,
  CheckCircle,
  Clock,
  Package
} from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-gradient opacity-5" />
        <div className="container py-20 md:py-32 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-critical/10 text-critical mb-6">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Disaster Relief Platform</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Connect. Support.{' '}
              <span className="text-gradient">Save Lives.</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              A platform connecting disaster-affected individuals with donors and organizations
              for efficient resource distribution during emergencies.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="min-w-[180px]" asChild>
                <Link to="/register">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="min-w-[180px]" asChild>
                <Link to="/login">
                  Sign In
                </Link>
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <span>Verified Organizations</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <span>Secure & Trusted</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-warning" />
                <span>Real-time Matching</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Whether you need help or want to contribute, our platform makes disaster relief simple and efficient.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="card-elevated text-center">
              <CardContent className="pt-8 pb-6">
                <div className="w-14 h-14 rounded-full bg-critical/10 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-7 w-7 text-critical" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Request Help</h3>
                <p className="text-sm text-muted-foreground">
                  Submit a resource request with details about what you need, urgency level, and location.
                </p>
              </CardContent>
            </Card>

            <Card className="card-elevated text-center">
              <CardContent className="pt-8 pb-6">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Package className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Get Matched</h3>
                <p className="text-sm text-muted-foreground">
                  Our system matches requests with nearby donors based on resource type, proximity, and urgency.
                </p>
              </CardContent>
            </Card>

            <Card className="card-elevated text-center">
              <CardContent className="pt-8 pb-6">
                <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                  <HeartHandshake className="h-7 w-7 text-success" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Receive Support</h3>
                <p className="text-sm text-muted-foreground">
                  Coordinate delivery, track progress, and confirm receipt with proof of delivery.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* User Types */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Who Can Use HopeHub?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Our platform serves individuals, organizations, and government coordinators to create a comprehensive relief network.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="card-elevated overflow-hidden group hover:border-primary/30 transition-colors">
              <div className="h-2 bg-primary" />
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">Individuals</h3>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    Request & donate resources
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    Build trust score over time
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    Phone & email verification
                  </li>
                </ul>
                <Button variant="outline" className="w-full mt-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors" asChild>
                  <Link to="/register?type=individual">
                    Sign up as Individual
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="card-elevated overflow-hidden group hover:border-info/30 transition-colors">
              <div className="h-2 bg-info" />
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-info/10">
                    <Building2 className="h-5 w-5 text-info" />
                  </div>
                  <h3 className="font-semibold text-lg">Organizations</h3>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    NGOs, Hospitals, Schools
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    Verified profile & metrics
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    Receive direct help requests
                  </li>
                </ul>
                <Button variant="outline" className="w-full mt-6 group-hover:bg-info group-hover:text-info-foreground transition-colors" asChild>
                  <Link to="/register?type=organization">
                    Register Organization
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="card-elevated overflow-hidden group hover:border-warning/30 transition-colors">
              <div className="h-2 bg-warning" />
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-warning/10">
                    <Shield className="h-5 w-5 text-warning" />
                  </div>
                  <h3 className="font-semibold text-lg">District POCs</h3>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    Government officials
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    Verify & approve requests
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    Access analytics dashboard
                  </li>
                </ul>
                <Button variant="outline" className="w-full mt-6 group-hover:bg-warning group-hover:text-warning-foreground transition-colors" asChild>
                  <Link to="/register?type=poc">
                    Register as POC
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-hero-gradient text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Make a Difference?
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
            Join thousands of individuals and organizations working together to provide relief during disasters.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" variant="secondary" className="min-w-[180px]" asChild>
              <Link to="/register">
                Create Account
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="min-w-[180px] border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" asChild>
              <Link to="/browse">
                Browse Requests
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xl text-primary">HopeHub</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 HopeHub. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
