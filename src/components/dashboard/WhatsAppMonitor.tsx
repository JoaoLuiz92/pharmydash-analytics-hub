import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Clock, MessageCircle } from "lucide-react";
import { differenceInMinutes, differenceInHours } from "date-fns";

// Palavras que indicam finalização da conversa
const CLOSING_KEYWORDS = [
  "obrigado",
  "obrigada",
  "valeu",
  "até mais",
  "tchau",
  "adeus"
];

// Lista de vendedores disponíveis
const SELLERS = [
  "João Silva",
  "Maria Santos",
  "Carlos Oliveira",
  "Ana Costa",
  "Pedro Lima"
];

// Função para atribuir vendedor aleatoriamente
const getRandomSeller = () => {
  const randomIndex = Math.floor(Math.random() * SELLERS.length);
  return SELLERS[randomIndex];
};

// Função para verificar se a conversa deve ser resetada (36 horas)
const shouldResetConversation = (startTime: string) => {
  const hours = differenceInHours(new Date(), new Date(startTime));
  return hours >= 36;
};

// Dados simulados - em produção, isso viria da API do WhatsApp Business
const conversations = [
  {
    id: 1,
    customer: "Maria Silva",
    lastMessage: "Gostaria de saber o preço do medicamento",
    phone: "5511999999999",
    startTime: new Date().toISOString(),
    lastCustomerMessageTime: new Date(Date.now() - 3 * 60000).toISOString(), // 3 minutos atrás
    lastAgentMessageTime: new Date(Date.now() - 2 * 60000).toISOString(), // 2 minutos atrás
    isOpen: true,
    attendedBy: getRandomSeller(),
    messages: [
      {
        content: "Gostaria de saber o preço do medicamento",
        timestamp: new Date(Date.now() - 3 * 60000).toISOString(),
        isFromCustomer: true
      },
      {
        content: "Claro! O medicamento custa R$ 50,00",
        timestamp: new Date(Date.now() - 2 * 60000).toISOString(),
        isFromCustomer: false
      }
    ]
  },
  {
    id: 2,
    customer: "João Santos",
    lastMessage: "Vocês têm disponível?",
    phone: "5511888888888",
    startTime: new Date().toISOString(),
    lastCustomerMessageTime: new Date(Date.now() - 10 * 60000).toISOString(), // 10 minutos atrás
    lastAgentMessageTime: null,
    isOpen: true,
    attendedBy: getRandomSeller(),
    messages: [
      {
        content: "Vocês têm disponível?",
        timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
        isFromCustomer: true
      }
    ]
  },
  {
    id: 3,
    customer: "Ana Oliveira",
    lastMessage: "Obrigada pelo atendimento",
    phone: "5511777777777",
    startTime: new Date(Date.now() - 37 * 60 * 60000).toISOString(), // 37 horas atrás (deve ser resetada)
    lastCustomerMessageTime: new Date(Date.now() - 1 * 60000).toISOString(),
    lastAgentMessageTime: new Date(Date.now() - 2 * 60000).toISOString(),
    isOpen: false,
    attendedBy: getRandomSeller(),
    messages: [
      {
        content: "Posso ajudar com mais alguma coisa?",
        timestamp: new Date(Date.now() - 2 * 60000).toISOString(),
        isFromCustomer: false
      },
      {
        content: "Obrigada pelo atendimento",
        timestamp: new Date(Date.now() - 1 * 60000).toISOString(),
        isFromCustomer: true
      }
    ]
  }
];

const getConversationStatus = (conversation: typeof conversations[0]) => {
  // Se a conversa já está fechada, retorna 'closed'
  if (!conversation.isOpen) return "closed";

  const lastMessage = conversation.messages[conversation.messages.length - 1];
  
  // Verifica se a última mensagem contém palavras-chave de finalização
  if (lastMessage && lastMessage.isFromCustomer) {
    const messageContent = lastMessage.content.toLowerCase();
    if (CLOSING_KEYWORDS.some(keyword => messageContent.includes(keyword))) {
      return "closed";
    }
  }

  // Se não tem mensagem do agente ainda e passou de 5 minutos
  if (!conversation.lastAgentMessageTime && 
      differenceInMinutes(new Date(), new Date(conversation.lastCustomerMessageTime)) > 5) {
    return "unresponded";
  }

  // Se a última mensagem é do cliente e passou mais de 5 minutos
  if (lastMessage?.isFromCustomer && 
      differenceInMinutes(new Date(), new Date(conversation.lastCustomerMessageTime)) > 5) {
    return "unresponded";
  }

  // Se a última mensagem é do agente e está dentro dos 5 minutos
  if (!lastMessage?.isFromCustomer && 
      differenceInMinutes(new Date(), new Date(conversation.lastAgentMessageTime!)) <= 5) {
    return "waiting";
  }

  return "active";
};

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
  // Filtra apenas conversas que não devem ser resetadas
  const activeConversations = conversations
    .filter(conv => conv.isOpen && !shouldResetConversation(conv.startTime));
  
  const handleConversationClick = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${cleanPhone}`;
    window.open(whatsappUrl, '_blank');
  };

  const getWaitTime = (conversation: typeof conversations[0]) => {
    if (conversation.lastCustomerMessageTime) {
      return differenceInMinutes(new Date(), new Date(conversation.lastCustomerMessageTime));
    }
    return 0;
  };

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
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => handleConversationClick(conv.phone)}
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
                  <p className="text-xs text-muted-foreground">
                    Atendido por: {conv.attendedBy || "Não atribuído"}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {getWaitTime(conv)} min
                    </span>
                  </div>
                  <Badge
                    className={`${getStatusColor(getConversationStatus(conv))} text-white mt-1`}
                  >
                    {getStatusText(getConversationStatus(conv))}
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