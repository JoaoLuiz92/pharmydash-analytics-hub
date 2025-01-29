import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Clock, MessageCircle } from "lucide-react";
import { differenceInMinutes, differenceInHours } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

// Palavras que indicam finalização da conversa
const CLOSING_KEYWORDS = [
  "obrigado",
  "obrigada",
  "valeu",
  "até mais",
  "tchau",
  "adeus"
];

// Função para verificar se a conversa deve ser resetada (36 horas)
const shouldResetConversation = (startTime: string) => {
  const hours = differenceInHours(new Date(), new Date(startTime));
  return hours >= 36;
};

const getConversationStatus = (conversation: any) => {
  if (!conversation.is_open) return "closed";

  // Verifica se a última mensagem contém palavras-chave de finalização
  if (conversation.last_message?.is_from_customer) {
    const messageContent = conversation.last_message.content.toLowerCase();
    if (CLOSING_KEYWORDS.some(keyword => messageContent.includes(keyword))) {
      return "closed";
    }
  }

  // Se não tem mensagem do agente ainda e passou de 5 minutos
  if (!conversation.last_agent_message_time && 
      differenceInMinutes(new Date(), new Date(conversation.last_customer_message_time)) > 5) {
    return "unresponded";
  }

  // Se a última mensagem é do cliente e passou mais de 5 minutos
  if (conversation.last_message?.is_from_customer && 
      differenceInMinutes(new Date(), new Date(conversation.last_customer_message_time)) > 5) {
    return "unresponded";
  }

  // Se a última mensagem é do agente e está dentro dos 5 minutos
  if (!conversation.last_message?.is_from_customer && 
      differenceInMinutes(new Date(), new Date(conversation.last_agent_message_time)) <= 5) {
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
  const { toast } = useToast();

  const { data: conversations, isLoading } = useQuery({
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
        .order('created_at', { ascending: false })
        .limit(1);

      if (conversationsError) {
        console.error('Error fetching conversations:', conversationsError);
        throw conversationsError;
      }

      return conversationsData || [];
    }
  });

  // Configurar canal de tempo real para atualizações
  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations'
        },
        (payload) => {
          console.log('Realtime update:', payload);
          toast({
            title: "Nova atualização",
            description: "Uma conversa foi atualizada"
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  // Filtra apenas conversas que não devem ser resetadas
  const activeConversations = conversations?.filter(
    conv => conv.is_open && !shouldResetConversation(conv.start_time)
  ) || [];
  
  const handleConversationClick = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${cleanPhone}`;
    window.open(whatsappUrl, '_blank');
  };

  const getWaitTime = (conversation: any) => {
    if (conversation.last_customer_message_time) {
      return differenceInMinutes(new Date(), new Date(conversation.last_customer_message_time));
    }
    return 0;
  };

  if (isLoading) {
    return (
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Monitor WhatsApp</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48">
            <p>Carregando conversas...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

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
            {conversations?.filter(conv => !conv.is_open).length} finalizados hoje
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activeConversations.map((conv) => (
            <div
              key={conv.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => handleConversationClick(conv.customer_phone)}
            >
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarFallback>
                    {conv.customer_name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{conv.customer_name}</p>
                  <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                    {conv.last_message?.[0]?.content || "Sem mensagens"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Atendido por: {conv.agent?.profile?.full_name || "Não atribuído"}
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