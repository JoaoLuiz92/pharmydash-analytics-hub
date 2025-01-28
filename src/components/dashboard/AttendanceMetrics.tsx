import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, CheckCircle, XCircle } from "lucide-react";
import { differenceInMinutes, subDays, subHours } from "date-fns";
import { MetricCard } from "./MetricCard";

// Interface para as estatísticas de atendimento
interface AttendanceStats {
  completed: number;
  uncompleted: number;
  averageTime: number;
}

// Função para calcular o tempo médio de atendimento (em minutos)
const calculateAverageTime = (conversations: any[], startDate: Date) => {
  const relevantConversations = conversations.filter(
    conv => new Date(conv.startTime) >= startDate && !conv.isOpen
  );

  if (relevantConversations.length === 0) return 0;

  const totalTime = relevantConversations.reduce((acc, conv) => {
    const startTime = new Date(conv.startTime);
    const endTime = new Date(conv.lastCustomerMessageTime);
    return acc + differenceInMinutes(endTime, startTime);
  }, 0);

  return Math.round(totalTime / relevantConversations.length);
};

// Função para calcular estatísticas de atendimento
const calculateStats = (conversations: any[], startDate: Date): AttendanceStats => {
  const relevantConversations = conversations.filter(
    conv => new Date(conv.startTime) >= startDate
  );

  return {
    completed: relevantConversations.filter(conv => !conv.isOpen).length,
    uncompleted: relevantConversations.filter(conv => conv.isOpen).length,
    averageTime: calculateAverageTime(conversations, startDate)
  };
};

export function AttendanceMetrics({ conversations }: { conversations: any[] }) {
  // Calcular estatísticas para diferentes períodos
  const last24h = calculateStats(conversations, subHours(new Date(), 24));
  const last7d = calculateStats(conversations, subDays(new Date(), 7));
  const last30d = calculateStats(conversations, subDays(new Date(), 30));

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <MetricCard
        title="Tempo Médio de Atendimento"
        value={`${last24h.averageTime} min`}
        icon={<Clock className="h-4 w-4 text-primary" />}
        description="Últimas 24 horas"
      />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Atendimentos 24h
          </CardTitle>
          <div className="flex space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <XCircle className="h-4 w-4 text-red-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {last24h.completed}/{last24h.completed + last24h.uncompleted}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {last24h.uncompleted} em andamento
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Atendimentos 7 dias
          </CardTitle>
          <div className="flex space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <XCircle className="h-4 w-4 text-red-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {last7d.completed}/{last7d.completed + last7d.uncompleted}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {last7d.uncompleted} em andamento
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Atendimentos 30 dias
          </CardTitle>
          <div className="flex space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <XCircle className="h-4 w-4 text-red-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {last30d.completed}/{last30d.completed + last30d.uncompleted}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {last30d.uncompleted} em andamento
          </p>
        </CardContent>
      </Card>
    </div>
  );
}