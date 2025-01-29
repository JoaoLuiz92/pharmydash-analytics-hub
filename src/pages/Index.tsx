import { Activity, DollarSign, Users, Package, LogOut } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { PatientList } from "@/components/dashboard/PatientList";
import { WhatsAppMonitor } from "@/components/dashboard/WhatsAppMonitor";
import { AttendanceMetrics } from "@/components/dashboard/AttendanceMetrics";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: conversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const { data: conversationsData, error: conversationsError } = await supabase
        .from('conversations')
        .select(`
          *,
          agent:agents(
            profile:profiles(
              full_name
            )
          ),
          last_message:messages(
            content,
            is_from_customer,
            timestamp
          )
        `)
        .order('created_at', { ascending: false });

      if (conversationsError) {
        console.error('Error fetching conversations:', conversationsError);
        throw conversationsError;
      }

      return conversationsData || [];
    }
  });

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    toast({
      title: "Logout realizado com sucesso",
      description: "Até logo!",
    });
    navigate("/monitor");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">PharmyDash</h1>
            <p className="text-gray-500">
              Bem-vindo ao seu painel de controle de vendas e atendimentos
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Vendas Hoje"
            value="R$ 1.250,00"
            icon={<DollarSign className="h-4 w-4 text-primary" />}
            description="+20.1% em relação a ontem"
          />
          <MetricCard
            title="Atendimentos"
            value="48"
            icon={<Users className="h-4 w-4 text-primary" />}
            description="12 em andamento"
          />
          <MetricCard
            title="Taxa de Conversão"
            value="65%"
            icon={<Activity className="h-4 w-4 text-primary" />}
            description="+5% em relação à média"
          />
          <MetricCard
            title="Produtos Vendidos"
            value="124"
            icon={<Package className="h-4 w-4 text-primary" />}
            description="32 diferentes itens"
          />
        </div>

        <AttendanceMetrics conversations={conversations || []} />

        <div className="grid gap-4 md:grid-cols-7">
          <SalesChart />
          <PatientList />
        </div>

        <div className="grid gap-4">
          <WhatsAppMonitor />
        </div>
      </div>
    </div>
  );
};

export default Index;