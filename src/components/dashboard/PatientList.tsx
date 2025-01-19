import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const patients = [
  {
    name: "João Silva",
    status: "Aguardando Pagamento",
    value: "R$ 150,00",
    date: "2024-05-07",
  },
  {
    name: "Maria Santos",
    status: "Venda Concluída",
    value: "R$ 200,00",
    date: "2024-05-07",
  },
  {
    name: "Pedro Oliveira",
    status: "Em Atendimento",
    value: "R$ 180,00",
    date: "2024-05-07",
  },
];

export function PatientList() {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Atendimentos Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {patients.map((patient) => (
            <div
              key={patient.name}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarFallback>
                    {patient.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{patient.name}</p>
                  <p className="text-sm text-muted-foreground">{patient.status}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">{patient.value}</p>
                <p className="text-sm text-muted-foreground">{patient.date}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}