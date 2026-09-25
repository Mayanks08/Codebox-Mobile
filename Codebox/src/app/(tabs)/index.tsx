import { useAuth } from '@/hooks/use-auth'
import { useScreenInsets } from '@/hooks/use-screen-insets'
import { fetchProblems, fetchSolvedCount } from '@/lib/problems'
import { colors } from '@/lib/theme'
import { getAvatar, getDisplayName, getInitials } from '@/lib/user'
import { Feather, Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function HomeScreen() {
  const {contentPadding} = useScreenInsets(
    {bottom:24 , topExtra: 8})
    const { user ,  isLoading } = useAuth()
    const [firstProblem, setFirstProblemId] = useState<string|null >(null)
    const [solvedCount, setSolvedCount] = useState<number|null>(null)

  useEffect(() => {
    if(!user?.id) return
    fetchProblems().then((problems) => setFirstProblemId(problems[0]?.id ?? null)) },
    fetchSolvedCount(user.id).then(setSolvedCount) 
 [user?.id])

  if(isLoading || !user) {
    return(
      <SafeAreaView style = {styles.loading} edges={['top', 'bottom']}>
        <ActivityIndicator  color={colors.lime} />
      </SafeAreaView>
    )
  }


const displayName = getDisplayName(user)
const firstName = displayName.split(' ')[0] ?? 'Rider'
const initials = getInitials(user)
const avatarUrl = getAvatar(user)

return (
    <View style={styles.screen}>
  <SafeAreaView style={styles.safe} edges={['top']}>
    <ScrollView
      contentContainerStyle={[styles.scroll, contentPadding]}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior="automatic"
    >
      <View style={styles.topRow}>
        <View style={styles.brandRow}>
          <View style={styles.logoBox}>
            <Image
              source={require('@/assets/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.brand}>Codebox</Text>
        </View>
      </View>

      <View style={styles.welcomeRow}>
        <View style={styles.avatar}>
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              style={styles.avatarImage}
            />
          ) : (
            <Text style={styles.avatarInitials}>{initials}</Text>
          )}
        </View>

        <View style={styles.welcomeText}>
          <Text style={styles.welcomeLabel}>
            Welcome back
          </Text>

          <Text
            style={styles.welcomeName}
            numberOfLines={1}
          >
            {firstName}
          </Text>
        </View>
      </View>

      <View style={styles.heroCard}>
        <View style={styles.heroContent}>
          <View style={styles.heroTextWrap}>
            <Text style={styles.heroTitle}>
              Ready to code?
            </Text>

            <Text style={styles.heroSubtitle}>
              Solve problems and build your career streaks.
            </Text>
          </View>

          <View style={styles.heroIcon}>
            <Ionicons
              name="rocket"
              size={28}
              color={colors.lime}
            />
          </View>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Continue learning
        </Text>

        <Text style={styles.sectionHint}>
          Tap to start
        </Text>
      </View>

      <View style={styles.actions}>
        <ActionCard
          icon="map"
          color={colors.peach}
          title="Browse Problems"
          subtitle="Pick from the problem set"
          onPress={() => router.push('/problems' as never)}
        />

        <ActionCard
          icon="navigate"
          color={colors.mint}
          title="Daily Challenge"
          subtitle="Start solving your first problem"
          onPress={() => {
            if (firstProblemId) {
              router.push(`/problems/${firstProblemId}` as never)
            } else {
              router.push('/problems' as never)
            }
          }}
        />

        <ActionCard
          icon="bookmark"
          color={colors.mint}
          title="Saved Progress"
          subtitle="Bookmarks are coming soon"
          onPress={() => {
            router.push('/problems' as never)
          }}
        />
      </View>

      <View style={styles.weekSection}>
        <Text style={styles.sectionTitle}>
          This week
        </Text>

        <View style={styles.statsRow}>
          <StatCard
            label="Solved"
            value={String(solvedCount)}
            tint={colors.lime}
          />

          <StatCard
            label="Streak"
            value="0"
            tint={colors.peach}
          />

          <StatCard
            label="Saved"
            value="0"
            tint={colors.mint}
          />
        </View>
      </View>
    </ScrollView>
  </SafeAreaView>
</View>

)
}

function ActionCard({
  icon,
  color, 
  title,
  subtitle,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap
  color: string
  title: string
  subtitle: string
  onPress: () => void
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionCard,
        pressed && Styles.pressed]}
        >
        <View style={[styles.actionIcon, { backgroundColor: `{color}26` }]}>
          <Ionicons
            name={icon}
            size={20}
            color={color}
          />
        </View>
        <View style={styles.actionText}>
          <Text style={styles.actionTitle}>
            {title}
          </Text>
          <Text style={styles.actionSubtitle}>
            {subtitle}
          </Text>
        </View>
        <Feather name="chevron-right" size={18} color="#a1a1aa" />
        </Pressable>
  )
}