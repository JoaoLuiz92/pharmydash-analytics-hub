import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Clock, MessageCircle } from "lucide-react";

// Dados simulados - em produção, isso viria da API do WhatsApp Business
const conversations = [
  {
    id: 1,
    customer: "Maria Silva",
    waitTime: 15,
    lastMessage: "Gostaria de saber o preço do medicamento",
    status: "waiting",
    phone: "5511999999999",
    startTime: "2024-01-19T10:00:00",
    isOpen: true,
    attendedBy: null
  },
  {
    id: 2,
    customer: "João Santos",
    waitTime: 30,
    lastMessage: "Vocês têm disponível?",
    status: "unresponded",
    phone: "5511888888888",
    startTime: "2024-01-19T09:30:00",
    isOpen: true,
    attendedBy: null
  },
  {
    id: 3,
    customer: "Ana Oliveira",
    waitTime: 5,
    lastMessage: "Obrigada pelo atendimento",
    status: "active",
    phone: "5511777777777",
    startTime: "2024-01-19T10:15:00",
    isOpen: true,
    attendedBy: "Carlos"
  },
  {
    id: 4,
    customer: "Pedro Costa",
    waitTime: 0,
    lastMessage: "Compra finalizada com sucesso",
    status: "closed",
    phone: "5511666666666",
    startTime: "2024-01-19T08:00:00",
    isOpen: false,
    attendedBy: "Maria",
    closedAt: "2024-01-19T08:45:00",
    resolution: "sale" // pode ser 'sale', 'cancelled', 'transferred'
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "waiting":
      return "bg-yellow-500";
    case "unresponded":
      return "bg-red-500";
    case "active":
      return "bg-green-500";
    case "closed":
      return "bg-gray-500";
    default:
      return "bg-gray-500";
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "waiting":
      return "Aguardando";
    case "unresponded":
      return "Sem Resposta";
    case "active":
      return "Em Atendimento";
    case "closed":
      return "Finalizado";
    default:
      return "Desconhecido";
  }
};

export function WhatsAppMonitor() {
  // Filtra apenas conversas abertas por padrão
  const activeConversations = conversations.filter(conv => conv.isOpen);
  
  return (
    <Card className="col-span-3">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Monitor WhatsApp</CardTitle>
        <div className="flex gap-2">
          <Badge variant="outline" className="ml-2">
            <MessageCircle className="w-4 h-4 mr-1" />
            {activeConversations.length} conversas ativas
          </Badge>
          <Badge variant="outline" className="ml-2">
            {conversations.filter(conv => !conv.isOpen).length} finalizados hoje
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activeConversations.map((conv) => (
            <div
              key={conv.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarFallback>
                    {conv.customer
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{conv.customer}</p>
                  <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                    {conv.lastMessage}
                  </p>
                  {conv.attendedBy && (
                    <p className="text-xs text-muted-foreground">
                      Atendido por: {conv.attendedBy}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {conv.waitTime} min
                    </span>
                  </div>
                  <Badge
                    className={`${getStatusColor(conv.status)} text-white mt-1`}
                  >
                    {getStatusText(conv.status)}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}