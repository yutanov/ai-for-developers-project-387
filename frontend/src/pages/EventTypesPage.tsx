import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useEventTypes } from '@/hooks/useApi'

export default function EventTypesPage() {
  const { data, isLoading } = useEventTypes()
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-muted-foreground">
        Загрузка...
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8 flex items-center gap-4">
        <Avatar className="h-14 w-14">
          <AvatarImage src="https://api.dicebear.com/9.x/avataaars/svg?seed=Tota" />
          <AvatarFallback>TH</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-lg font-semibold">Tota</p>
          <p className="text-sm text-muted-foreground">Host</p>
        </div>
      </div>

      <h1 className="mb-1 text-2xl font-semibold">Выберите тип события</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Нажмите на карточку, чтобы открыть календарь и выбрать свободное время
      </p>

      <div className="grid gap-4">
        {data?.data.map((eventType) => (
          <Card
            key={eventType.id}
            className="cursor-pointer transition-shadow hover:shadow-md"
            onClick={() => navigate(`/book/${eventType.id}`)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{eventType.title}</CardTitle>
                <Badge variant="secondary">{eventType.duration} мин</Badge>
              </div>
              <CardDescription>{eventType.description}</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {eventType.duration} мин
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
