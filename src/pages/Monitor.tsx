import { WhatsAppMonitor } from "@/components/dashboard/WhatsAppMonitor";

const Monitor = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Monitor de Atendimento</h1>
          <p className="text-gray-500">
            Acompanhamento em tempo real das conversas do WhatsApp
          </p>
        </div>
        <WhatsAppMonitor />
      </div>
    </div>
  );
};

export default Monitor;