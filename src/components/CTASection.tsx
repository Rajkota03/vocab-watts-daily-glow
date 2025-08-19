import React from 'react';
import { Button } from "@/components/ui/button";
import { Calendar, Sparkles, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import SignupForm from './SignupForm';
const CTASection = () => {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  return <section className="section-padding-lg bg-gradient-to-br from-primary to-duolingo-purple text-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-white"></div>
        <div className="absolute bottom-10 right-10 w-60 h-60 rounded-full bg-white"></div>
      </div>
      
      <div className="container-wide relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center mb-6 bg-white/20 backdrop-blur-sm py-2 px-4 rounded-full shadow-lg">
            <Sparkles className="h-5 w-5 mr-2 text-duolingo-yellow" />
            <span className="text-sm font-medium">Elevate your vocabulary with zero effort</span>
          </div>
          
          <h2 className="heading-xl mb-4">
            Build a powerful vocabulary — one word at a time.
          </h2>
          
          <p className="body-text mb-6 opacity-90">
            Start with your first word today.
          </p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-8">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-accent hover:bg-accent/90 text-white text-base group px-8 py-6 rounded-full transition-all hover:scale-105 hover:shadow-xl w-full md:w-auto font-medium shadow-lg">
                  <Calendar className="mr-2 h-5 w-5" />
                  Send Me a Sample Word
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <SignupForm />
              </DialogContent>
            </Dialog>
            
            <Button onClick={() => navigate('/payment', {
            state: {
              plan: {
                isPro: true,
                price: 249
              }
            }
          })} className="bg-white hover:bg-gray-100 text-primary text-base group px-8 py-6 rounded-full transition-all hover:scale-105 hover:shadow-xl w-full md:w-auto font-medium shadow-lg">
              <Sparkles className="mr-2 h-5 w-5" />
              Subscribe for ₹249/month
            </Button>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-x-8 gap-y-3 text-sm">
            <div className="flex items-center bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
              <CheckCircle className="h-4 w-4 mr-2 text-white" />
              <span>Verified WhatsApp number</span>
            </div>
            <div className="flex items-center bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
              <CheckCircle className="h-4 w-4 mr-2 text-white" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
              <CheckCircle className="h-4 w-4 mr-2 text-white" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default CTASection;