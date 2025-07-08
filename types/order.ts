export type Order = {
  id: number
  name: string
  price: number
  order_number: string
  created_at: string
  due_date: string | null
  status: 'unfinished' | 'finished'
}
