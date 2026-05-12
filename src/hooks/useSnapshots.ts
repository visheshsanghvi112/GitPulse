import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useSnapshots(duration: 'today' | 'week' | 'month' = 'week') {
  const { data, error } = useSWR(`/api/trending?duration=${duration}`, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 600000
  })
  return { data, error, loading: !data && !error }
}

export default useSnapshots
