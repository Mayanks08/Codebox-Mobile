import { useAuth } from '@/hooks/use-auth'
import { useScreenInsets } from '@/hooks/use-screen-insets'
import {
  difficultyTint,
  fetchProblemById,
  fetchUserSubmissionsForProblem,
  getConstraintLines,
  getExamples,
  type LanguageExample,
  type Problem,
  type SubmissionListItem,
} from '@/lib/problems'
import { colors } from '@/lib/theme'
import { Feather, Ionicons } from '@expo/vector-icons'
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router'
import { use, useCallback, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

type Tab = 'description' | 'solutions' | 'submissions'

const TABS: {id:Tab; label:string; icon:keyof typeof Feather.glyoMap}[] = [
  { id: 'description', label: 'Description', icon: 'file-text' },
  { id: 'solutions', label: 'Solutions', icon: 'lock' },
  { id: 'submissions', label: 'Submissions', icon: 'list' },
]

export default function ProblemDetailsScreen() {
  const { contentPadding } = useScreenInsets({
    includeBottomInset: true,
    bottomExtra: 28,
    topExtra: 8,
  })

  const { user } = useAuth()

  const { id } = useLocalSearchParams<{ id: string }>()

  const [problem, setProblem] = useState<Problem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [activeTab, setActiveTab] =
    useState<Tab>('description')

  const [submissionsLoading, setSubmissionLoading] =
    useState(false)

  const [submissions, setSubmissions] =
    useState<SubmissionListItem[]>([])

  useEffect(() => {
    let active = true

    async function load() {
      if (!id) return

      setLoading(true)
      setError(null)

      try {
        const data = await fetchProblemById(id)

        if (!active) return

        setProblem(data)
      } catch (err) {
        if (!active) return

        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load Problem'
        )
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void load()

    return () => {
      active = false
    }
  }, [id])

  useFocusEffect(
    useCallback(() => {
      if (!id || !user?.id) return

      setSubmissionLoading(true)

      fetchUserSubmissionsForProblem(user.id, id)
        .then(setSubmissions)
        .finally(() => setSubmissionLoading(false))
    }, [id, user?.id])
  )

  if (loading) {
    return (
      <SafeAreaView
        style={styles.centered}
        edges={['top', 'bottom']}
      >
        <ActivityIndicator color={colors.lime} />
      </SafeAreaView>
    )
  }

  if (error || !problem) {
    return (
      <SafeAreaView
        style={styles.centered}
        edges={['top', 'bottom']}
      >
        <Feather
          name="alert-circle"
          size={32}
          color={colors.mutedDark}
        />

        <Text style={styles.notFoundTitle}>
          Problem Not Found
        </Text>

        <Text style={styles.notFoundSubtitle}>
          {error ??
            `The problem with id "${id}" doesn't exist yet.`}
        </Text>
        <Pressable 
          onPress={() => router.replace('/problems' as never)} 
          style= {({ pressed }) => [
            styles.backButton,
            pressed && styles.pressed 
          ]}>
            <Text style={styles.backButtonText}>Back to Problems</Text>
          </Pressable>
      </SafeAreaView>
    )
  }

  const tint = difficultyTint(problem.difficulty)



  return (
    <View style = {styles.screen}>
      <SafeAreaView style = {styles.safe} edges={['top']}>
        <ScrollView
          contentContainerStyle={[styles.scroll , contentPadding]}
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior="automatic"
        >
          <View style={styles.navRow}>
            <Pressable
            onpress ={() => router.back()}
            hitslop= {8}
            style={({ pressed }) => [
              styles.iconButton,
              pressed && styles.pressed
            ]}
            >
              <Feather name = "arrow-left" size={18} color={colors.foreground} />
              </Pressable> 
              <Text styles = {styles.navTitle}>
                problem Details
              </Text>
              </View>
              
                 <View style={styles.titleRow}>
            <Text style={styles.problemTitle}>{problem.title}</Text>
            <View style={[styles.difficultyBadge, { backgroundColor: tint.bg }]}>
              <Text style={[styles.difficultyText, { color: tint.fg }]}>
                {problem.difficulty}
              </Text>
            </View>
          </View>
  ) 
}