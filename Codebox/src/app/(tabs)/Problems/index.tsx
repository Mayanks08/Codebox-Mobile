import { useScreenInsets } from '@/hooks/use-screen-insets'
import {
  difficultyLabel,
  difficultyTint,
  fetchProblems,
  type Difficulty,
  type ProblemListItem,
} from '@/lib/problems'
import { colors } from '@/lib/theme'
import { Feather, Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const DIFFICULTIES: Difficulty[] = ['EASY', 'MEDIUM', 'HARD']

export default function  ProblemsScreen() {
  const { contentPadding, sheetPaddingBottom } = useScreenInsets({
    bottomExtra: 24,
    topExtra: 12,
  })
  const [problems, setProblems] = useState<ProblemListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [activeDifficulties, setActiveDifficulties] = useState<Set<Difficulty>>(
    new Set()
  )

  const load = useCallback(async (isRefresh = false) => {
    if(isRefresh) setRefreshing(true)
      else setLoading(true)
      setError(null)
      try{
        const data = await fetchProblems()
        setProblems(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load Problems')
      } finally {
        setLoading(false)
        setRefreshing(false)
      } 
    },[])
    useEffect(() => {
      void load ()
    }, [load])

    const filtered = useMomo(() => {
      const query = search.trim().toLowerCase()
      return problems.filter((problem) => {
        if ( 
          activeDifficulties.size > 0 && !activeDifficulties.has(problem.difficulty))
          {
            return false
          }
          if(!query) return true
            return (problem.title.toLowerCase().includes(query) ||
            problem.tags.some((tag) => tag.toLowerCase().includes(query))
        )
      })} , [problems, search, activeDifficulties])

      const toggleDifficulty = ((difficulty: Difficulty) => {
        setActiveDifficulties((prev) => {
          const next = new Set(prev)
          if(next.has(difficulty)) next.delete(difficulty)
          else next.add(difficulty)
          return next
        })
        
      })
      }

      return (
        <View style= {styles.screen}>
          <SafeAreaView style={styles.safe} edges={['top']}>
            <ScrollView
              contentContainerStyle={[styles.scroll, contentPadding]}
              showsVerticalScrollIndicator={false}
              contentInsetAdjustmentBehavior="automatic"
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => void load(true)}
                  tintColor={colors.lime}
                />
              }
            >
              <View style={styles.headerRow}>
                <Text style={styles.title}>Coding Problems</Text>
                <View style={style.countBadge}>
                  <Text Style= {styles.countText}>{problems.length} Total</Text>
                </View>
              </View>
              <View style={styles.searchBox}>
                <Feather name="search" size={20} color={colors.mutedDark} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search by title or tag"
                  placeholderTextColor={colors.mutedDark}
                  value={search}
                  onChangeText={setSearch}
                  returnKeyType="search"
                />
                {search.length > 0 ? (
                  <Pressable onPress={() => setSearch('')} hitshlop= {8}>
                    <Feather name='x' size={14} color={colors.mutedDark} />
                    </Pressable>
                ) : null}
              </View>

              <Pressable 
                onPress={() => setFiltersOpen(true)}
                style={({pressed}) => [
                  styles.filterButton,
                  pressed && styles.filterButton,
                ]}
              >
                <Ionicons name="filter-outline" size={16} color={colors.mutedDark} />
                <Text style={styles.filterLabel}>Filters</Text>
                {activeDifficulties.size > 0 ? (
                  <View style={styles.filterCount}>
                    <Text style={styles.filterCountText}>{activeDifficulties.size}</Text>
                  </View>
                ) : null}
              </Pressable>

              <View style={styles.list}>
                {loading ? (
                  <ActivityIndicator size={{marginTop: 40 }} color={colors.lime}  />
                ) : error ? (
                  <View style={styles.empty}
                  <Feather name="alert-circle" size={28} color={colors.mutedDark} />
                  <Text style={styles.emptyTitle}>Failed to load problems</Text>
                  <Text style={styles.emptySubtitle}>{error}</Text>
                  <Pressable
                    onPress={() =>  load()}
                    style={({pressed}) => [
                      styles.retryButton,
                      pressed && styles.Pressed,
                    ]}
                  >
                    <Text style={styles.retryButtonText}>Try again</Text>
                  </Pressable>
                  </View>
                ) : filtered.length === 0 ? (
                  <View style={styles.empty}>
                    <Feather name="inbox" size={28} color={colors.mutedDark} />
                    <Text style={styles.emptyTitle}>No problems found</Text>
                    <Text style={styles.emptySubtitle}>
                      Try adjusting your search or filters
                    </Text>
                  </View>
                ) : (
                  filtered.map((problem) => (
                    <ProblemCard
                      key={problem.id}
                      problem={problem}
                      />
                  ))
                )}
              </View>
            </ScrollView>
          </SafeAreaView>
  )
}


const styles = StyleSheet.create({})