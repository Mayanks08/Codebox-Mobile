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

export default function ProblemsScreen() {
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

const index = () => {
  return (
    <View>
      <Text>index</Text>
    </View>
  )
}

export default index

const styles = StyleSheet.create({})