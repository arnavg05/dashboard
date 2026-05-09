'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function LoginPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function signIn() {
    setLoading(true)
    setMessage('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setMessage(error.message)
    else window.location.href = '/'
    setLoading(false)
  }

  async function signUp() {
    setLoading(true)
    setMessage('')
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) setMessage(error.message)
    else setMessage('Check your email to confirm your account.')
    setLoading(false)
  }

  async function sendMagicLink() {
    setLoading(true)
    setMessage('')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) setMessage(error.message)
    else setMessage('Magic link sent — check your inbox.')
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Life Dashboard</CardTitle>
          <CardDescription>Track your health, finances, habits, and studies</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="signin" className="flex-1">Sign In</TabsTrigger>
              <TabsTrigger value="signup" className="flex-1">Sign Up</TabsTrigger>
              <TabsTrigger value="magic" className="flex-1">Magic Link</TabsTrigger>
            </TabsList>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && signIn()}
                />
              </div>

              <TabsContent value="signin" className="mt-0 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password-signin">Password</Label>
                  <Input
                    id="password-signin"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && signIn()}
                  />
                </div>
                <Button className="w-full" onClick={signIn} disabled={loading}>
                  {loading ? 'Signing in…' : 'Sign In'}
                </Button>
              </TabsContent>

              <TabsContent value="signup" className="mt-0 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password-signup">Password</Label>
                  <Input
                    id="password-signup"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button className="w-full" onClick={signUp} disabled={loading}>
                  {loading ? 'Creating account…' : 'Create Account'}
                </Button>
              </TabsContent>

              <TabsContent value="magic" className="mt-0 space-y-4">
                <Button className="w-full" onClick={sendMagicLink} disabled={loading}>
                  {loading ? 'Sending…' : 'Send Magic Link'}
                </Button>
              </TabsContent>
            </div>

            {message && (
              <p className="mt-4 text-sm text-center text-muted-foreground">{message}</p>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
