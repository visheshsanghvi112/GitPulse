import fs from 'fs'
import path from 'path'
import { computeMomentum, TrendingSnapshot } from './intelligence'

interface Benchmark {
  repo: string
  category: string
  groundTruth: string
  notes: string
}

export function runBenchmarks() {
  const benchmarksPath = path.join(process.cwd(), 'data', 'benchmarks.json')
  if (!fs.existsSync(benchmarksPath)) {
    console.error('Benchmarks file not found')
    return
  }

  const benchmarks: Benchmark[] = JSON.parse(fs.readFileSync(benchmarksPath, 'utf-8'))
  const results = benchmarks.map(bm => {
    // We need real stars/rank from snapshots if available
    // For a real benchmark script, we'd need a way to mock/provide historical data
    // Here we just check the current state
    const snapshotsPath = path.join(process.cwd(), 'data', 'snapshots', bm.repo.replace('/', '__') + '.json')
    
    let currentStars = 0
    let currentRank = 25

    if (fs.existsSync(snapshotsPath)) {
      const snapshots: TrendingSnapshot[] = JSON.parse(fs.readFileSync(snapshotsPath, 'utf-8'))
      const latest = snapshots[snapshots.length - 1]
      currentStars = latest.stars
      currentRank = latest.rank
    }

    const momentum = computeMomentum(bm.repo, currentRank, currentStars)
    
    return {
      repo: bm.repo,
      category: bm.category,
      groundTruth: bm.groundTruth,
      predicted: momentum.classification,
      isCorrect: bm.groundTruth === momentum.classification,
      reasoning: momentum.reasoning,
      confidence: momentum.confidence.level
    }
  })

  console.table(results)
  
  const accuracy = (results.filter(r => r.isCorrect).length / results.length) * 100
  console.log(`\nOverall Accuracy: ${accuracy.toFixed(1)}%`)
}
