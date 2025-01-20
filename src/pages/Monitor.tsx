import { WhatsAppMonitor } from "@/components/dashboard/WhatsAppMonitor";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";

const Monitor = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Monitor de Atendimento</h1>
            <p className="text-gray-500">
              Acompanhamento em tempo real das conversas do WhatsApp
            </p>
          </div>
          <Button 
            variant="outline"
            onClick={() => navigate("/login")}
            className="gap-2"
          >
            <LogIn className="w-4 h-4" />
            Área Administrativa
          </Button>
        </div>
        <WhatsAppMonitor />
      </div>
    </div>
  );
};

export default Monitor;