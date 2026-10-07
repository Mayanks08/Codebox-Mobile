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

          <View style={styles.metaRow}>
            <View style={styles.metaleft}>
              <Feather name ="tag" size={13} color={colors.lime} />
              <Text style={styles.metaText}>{problem.tags.slice(0,2).join('.') || 'General'}</Text>
            </View>
            <Pressable
            onPress={() => Alert.alert('Report Bug ','Thanks! Bug Reporting is coming soon.')}
            hotslop={6}
            Style={({ pressed }) => [
              styles.reportButton,
              pressed && styles.pressed
            ]}
            >
              <Ionicons name="bug-outline" size={16} color={colors.muted} />
              <Text style={styles.reportText}>Report Bug</Text>
            </Pressable>
          </View>

          <View style ={styles.tabs}>
            {TABS.map((tab) => {
              const active = activeTab === tab.id
              return (
                <Pressable
                  key={tab.id}
                  onPress={() => setActiveTab(tab.id)}
                  style={({ pressed }) => [
                    styles.tabItem,
                    pressed && styles.pressed,]}
                >
                  <View style = {styles.tablabelRow}>
                    <Feather
                      name={tab.icon}
                      size={13}
                      color={active ?colors.peach : colors.muted}
                    />
                    <Text 
                    style = {[
                      styles.tabLabel,
                      { color: active ? colors.peach : colors.muted },
                    ]}
                    >
                      {tab.label}
                    </Text>
                  </View>
                  {active ? <View style={styles.tabIndicator} /> : null} 
                </Pressable>
              )
            })}
          </View>

          <View Style = {styles.tabBody}>
            {activeTab === 'description' ? (
              <Description problem={problem} />
            ) : null }
            { activeTab === 'solutions' ? (
              <LockedTab
              tile = "solutions are locked "
              subtitle = "Solutions will be available after you submit a correct solution."
              icon = "lock"
              />
            ) : null}
            {activeTab === 'submissions' ? (
              <SubmissionsTab
                submissions={submissions}
                loading={submissionsLoading}
              />
            ) : null}
            </View>
            <View style={styles.footer}>
              <Pressable
                onPress={() => router.push(`/problems/${problem.id}/submit` as never)}
                style={({ pressed }) => [
                  styles.submitButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.submitLabel}>Submit Solution</Text>
                <Feather name="play" size ={16} color= "#1f1208"/>
              </Pressable>
            </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  )}

  functiun descriptionTab ({ problem }: { problem: Problem }) {
    const examples = getExamples(problem)
    const contraints = getConstraintLines(problem.constraints)

    return (
      <View>
        <RichDescritpion text={problem.description} />

        {examples.map((example, index) => (
          <ExampleBlock
            key={index}
            example={example}
            index={index}
          />
        ))}
        {contraints.length > 0 ?  (
          <View style ={styles.section}>
            <Text style={styles.sectionTitle}>Constraints</Text>
            <View style= {styles.constaintsList}>
              {contraints.map((constraint, index) => (
                <View key ={index} style={styles.constraintRow}>
                  <Text Style ={styles.bullet }>•</Text>
                  <Text style={styles.constraintText}>{constraint}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null
          }
          {problem.tags.length  > 0 ? (
            <View style={styles.section}>
              <Text style={styles.TagsLabel}>TAGS</Text>
              <View style={styles.tagsRow}>
                {problem.tags.map((tag) => (
                  <View key ={tag} style ={styles.tagChip}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}
      </View>
  ) 
}

function LockedTab({
  example,
  index
}: {
  example: LanguageExample
  index: number
}) {
  return (
    <View style ={styles.section }>
      <Text Style={styles.sectionTitle}>Example {index + 1}</Text>
      <View style={styles.codeBlock}>
      <Text style={styles.codeLine}>
        <Text style={styles.codeMuted}>input :</Text>
        {example.input}
      </Text>
}



