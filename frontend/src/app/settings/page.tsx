"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Settings, RefreshCw, Save, Shield } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useRequireAuth, useUsers, useUpdateUserRoles } from "@/hooks";

interface UserRole {
  userId: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  enabled: boolean;
}

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  editor: "Editor",
  leitor: "Leitor",
};

const ROLE_COLORS: Record<string, "default" | "secondary" | "destructive"> = {
  admin: "destructive",
  editor: "default",
  leitor: "secondary",
};

export default function SettingsPage() {
  const { isReady } = useRequireAuth({ requiredRoles: ["admin"] });
  const { toast } = useToast();
  const [saving, setSaving] = useState<string | null>(null);
  const [userRoles, setUserRoles] = useState<Record<string, string[]>>({});
  const [availableRoles] = useState<string[]>(["admin", "editor", "leitor"]);

  // React Query hooks
  const { data: usersData = [], isLoading: loading, refetch, isError, error } = useUsers();
  const updateUserRolesMutation = useUpdateUserRoles();

  // Log para debug
  useEffect(() => {
    if (usersData.length > 0) {
      console.log("Dados de usuários recebidos:", usersData);
      console.log("Primeiro usuário:", usersData[0]);
    }
    if (isError) {
      console.error("Erro ao carregar usuários:", error);
    }
  }, [usersData, isError, error]);

  // Validar e processar dados dos usuários
  // O backend retorna UserRoleDto que tem userId (com U maiúsculo)
  const users = usersData.filter((user) => {
    const isValid = user && 
      typeof user.userId === 'string' && 
      typeof user.username === 'string' &&
      Array.isArray(user.roles);
    
    if (!isValid) {
      console.warn("Usuário inválido encontrado:", user);
    }
    return isValid;
  }).map(user => ({
    userId: user.userId,
    username: user.username || "",
    email: user.email || "",
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    roles: user.roles || [],
    enabled: user.enabled !== undefined ? user.enabled : true,
  }));

  // Inicializar userRoles quando usuários forem carregados
  useEffect(() => {
    if (users.length > 0 && Object.keys(userRoles).length === 0) {
      const initialRoles: Record<string, string[]> = {};
      users.forEach((user) => {
        // Filtrar apenas as roles principais (case-insensitive)
        const mainRoles = (user.roles || [])
          .filter((r) => availableRoles.some((ar) => ar.toLowerCase() === r.toLowerCase()))
          .map((r) => {
            // Normalizar para minúsculas
            const normalized = r.toLowerCase();
            return availableRoles.find((ar) => ar.toLowerCase() === normalized) || r;
          });
        initialRoles[user.userId] = mainRoles.length > 0 ? [mainRoles[0]] : []; // Apenas primeira role
      });
      setUserRoles(initialRoles);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users.length, availableRoles]);

  const handleRoleChange = (userId: string, roles: string[]) => {
    setUserRoles((prev) => ({
      ...prev,
      [userId]: roles,
    }));
  };

  const handleSaveRoles = async (userId: string) => {
    setSaving(userId);
    try {
      await updateUserRolesMutation.mutateAsync({
        userId,
        roles: userRoles[userId] || [],
      });
      toast({
        variant: "success",
        title: "Permissões atualizadas!",
        description: "As permissões do usuário foram atualizadas com sucesso.",
      });
      // O React Query já invalida e recarrega automaticamente
    } catch (error: any) {
      console.error("Erro ao atualizar permissões:", error);
      const errorMessage = error.response?.data?.error || error.response?.data?.details || error.message || "Não foi possível atualizar as permissões.";
      toast({
        variant: "error",
        title: "Erro ao atualizar permissões",
        description: errorMessage,
        duration: 8000,
      });
    } finally {
      setSaving(null);
    }
  };

  if (!isReady) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
            <p className="text-muted-foreground">
              Gerencie permissões e roles dos usuários do sistema
            </p>
          </div>
          <Button variant="outline" onClick={() => refetch()} disabled={loading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <CardTitle>Gerenciamento de Permissões</CardTitle>
            </div>
            <CardDescription>
              Atribua roles aos usuários para controlar o acesso ao sistema. Apenas administradores podem gerenciar permissões.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <RefreshCw className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <Settings className="h-12 w-12 text-destructive/50 mb-4" />
                <p className="text-destructive font-medium mb-2">Erro ao carregar usuários</p>
                <p className="text-sm text-muted-foreground mb-4">
                  {error instanceof Error ? error.message : "Não foi possível carregar a lista de usuários."}
                </p>
                <Button onClick={() => refetch()} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Tentar novamente
                </Button>
              </div>
            ) : users.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <Settings className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground mb-2">Nenhum usuário encontrado</p>
                <p className="text-sm text-muted-foreground">
                  {usersData.length > 0 
                    ? `${usersData.length} usuário(s) encontrado(s), mas nenhum passou na validação. Verifique o console.`
                    : "Nenhum usuário foi retornado pela API."}
                </p>
                <Button onClick={() => refetch()} variant="outline" className="mt-4">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Tentar novamente
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="hidden md:table-cell">Roles Atuais</TableHead>
                      <TableHead>Nova Role</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => {
                      const currentRoles = userRoles[user.userId] || [];
                      const userMainRoles = user.roles
                        .filter((r) => availableRoles.some((ar) => ar.toLowerCase() === r.toLowerCase()))
                        .map((r) => {
                          const normalized = r.toLowerCase();
                          return availableRoles.find((ar) => ar.toLowerCase() === normalized) || r;
                        });
                      const hasChanges =
                        JSON.stringify(currentRoles.sort()) !==
                        JSON.stringify(userMainRoles.sort());

                      return (
                        <TableRow key={user.userId}>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <span className="font-medium">
                                {user.firstName} {user.lastName}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                @{user.username}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="flex flex-wrap gap-1">
                              {user.roles
                                .filter((r) => availableRoles.some((ar) => ar.toLowerCase() === r.toLowerCase()))
                                .map((role) => {
                                  const normalized = role.toLowerCase();
                                  const roleKey = availableRoles.find((ar) => ar.toLowerCase() === normalized) || normalized;
                                  return (
                                    <Badge
                                      key={role}
                                      variant={ROLE_COLORS[roleKey] || "secondary"}
                                    >
                                      {ROLE_LABELS[roleKey] || role}
                                    </Badge>
                                  );
                                })}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={currentRoles.length > 0 ? currentRoles[0] : undefined}
                              onValueChange={(value) => {
                                // Cada usuário tem apenas uma role principal
                                handleRoleChange(user.userId, value ? [value] : []);
                              }}
                            >
                              <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Selecione uma role" />
                              </SelectTrigger>
                              <SelectContent>
                                {availableRoles.map((role) => (
                                  <SelectItem key={role} value={role}>
                                    {ROLE_LABELS[role] || role}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              onClick={() => handleSaveRoles(user.userId)}
                              disabled={!hasChanges || saving === user.userId}
                              className="gap-2"
                            >
                              {saving === user.userId ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                              ) : (
                                <Save className="h-4 w-4" />
                              )}
                              <span className="hidden sm:inline">
                                {saving === user.userId ? "Salvando..." : "Salvar"}
                              </span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Roles do Sistema</CardTitle>
            <CardDescription>
              Descrição das permissões de cada role no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 border rounded-lg">
                <Badge variant="destructive" className="mt-1">
                  Administrador
                </Badge>
                <div className="flex-1">
                  <p className="font-medium">Acesso total ao sistema</p>
                  <p className="text-sm text-muted-foreground">
                    Pode gerenciar produtos, categorias, usuários e permissões. Acesso completo a todas as funcionalidades.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 border rounded-lg">
                <Badge variant="default" className="mt-1">
                  Editor
                </Badge>
                <div className="flex-1">
                  <p className="font-medium">Pode criar e editar</p>
                  <p className="text-sm text-muted-foreground">
                    Pode criar, editar e visualizar produtos e categorias. Não pode excluir ou gerenciar permissões.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 border rounded-lg">
                <Badge variant="secondary" className="mt-1">
                  Leitor
                </Badge>
                <div className="flex-1">
                  <p className="font-medium">Apenas visualização</p>
                  <p className="text-sm text-muted-foreground">
                    Pode visualizar produtos, categorias e dashboard. Não pode criar, editar ou excluir.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
