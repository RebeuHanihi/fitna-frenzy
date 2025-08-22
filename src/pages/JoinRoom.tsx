import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { GameCard, GameCardHeader, GameCardTitle, GameCardContent } from '@/components/ui/game-card'
import { GameButton } from '@/components/ui/game-button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useGameStore } from '@/hooks/useGameStore'
import { supabase } from '@/integrations/supabase/client'

const JoinRoom = () => {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const { joinRoom, currentRoom } = useGameStore()
  
  const [realName, setRealName] = useState('')
  const [pseudo, setPseudo] = useState('')
  const [error, setError] = useState('')
  const [availableNames, setAvailableNames] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadRoomInfo = async () => {
      if (!code) return
      
      try {
        console.log('Loading room info for code:', code)
        const { data: roomData, error: roomError } = await supabase
          .from('game_rooms')
          .select('available_names')
          .eq('code', code.toUpperCase())
          .single()

        if (roomError || !roomData) {
          console.log('Room not found:', roomError)
          setError('Room introuvable avec ce code')
          setLoading(false)
          return
        }

        console.log('Room found, available names:', roomData.available_names)
        setAvailableNames(roomData.available_names || [])
        setLoading(false)
      } catch (err) {
        console.error('Error loading room info:', err)
        setError('Erreur lors du chargement de la room')
        setLoading(false)
      }
    }

    loadRoomInfo()
  }, [code])

  const handleJoin = async () => {
    if (!realName || !pseudo.trim()) {
      setError('Veuillez remplir tous les champs')
      return
    }

    console.log('Attempting to join room:', code, 'with name:', realName, 'pseudo:', pseudo)
    const success = await joinRoom(code || '', realName, pseudo)
    console.log('Join room result:', success)
    
    if (success) {
      navigate('/lobby')
    } else {
      setError('Impossible de rejoindre la room. Vérifiez le code et le prénom.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background px-4 py-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Chargement de la room...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-md mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-game-purple">
            Rejoindre la room
          </h1>
          <div className="bg-game-yellow px-4 py-2 rounded-xl inline-block">
            <span className="font-mono text-lg font-bold">
              {code}
            </span>
          </div>
        </div>

        {/* Join Form */}
        <GameCard variant="beige">
          <GameCardHeader>
            <GameCardTitle className="text-center text-game-purple">
              Choisissez votre identité
            </GameCardTitle>
          </GameCardHeader>
          <GameCardContent className="space-y-6">
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                <p className="text-destructive text-sm text-center">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">
                Choisissez votre prénom
              </label>
              <Select value={realName} onValueChange={setRealName}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un prénom" />
                </SelectTrigger>
                <SelectContent>
                  {availableNames.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Votre vrai prénom (visible dans les questions)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Votre pseudo
              </label>
              <Input
                placeholder="Ex: QueenS, Ninja42..."
                value={pseudo}
                onChange={(e) => setPseudo(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Pseudo anonyme (visible par les autres joueurs)
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <GameButton 
                variant="outline" 
                size="default"
                onClick={() => navigate('/')}
                className="flex-1"
              >
                Retour
              </GameButton>
              <GameButton 
                variant="purple" 
                size="default"
                onClick={handleJoin}
                disabled={!realName || !pseudo.trim()}
                className="flex-1"
              >
                Rejoindre
              </GameButton>
            </div>
          </GameCardContent>
        </GameCard>

        {/* Info */}
        <div className="text-center text-sm text-muted-foreground space-y-2">
          <p>🔒 Votre prénom et pseudo restent séparés</p>
          <p>🎭 L'anonymat est respecté pendant le jeu</p>
        </div>
      </div>
    </div>
  )
}

export default JoinRoom