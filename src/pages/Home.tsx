import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GameCard, GameCardHeader, GameCardTitle, GameCardContent } from '@/components/ui/game-card'
import { GameButton } from '@/components/ui/game-button'
import { Input } from '@/components/ui/input'
import { useGameStore } from '@/hooks/useGameStore'

const Home = () => {
  const navigate = useNavigate()
  const createRoom = useGameStore(state => state.createRoom)
  const [roomCode, setRoomCode] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [ownerName, setOwnerName] = useState('')
  const [ownerPseudo, setOwnerPseudo] = useState('')

  const handleCreateRoom = () => {
    if (!ownerName.trim() || !ownerPseudo.trim()) return

    // Default available names for demo
    const availableNames = ['Sophie', 'Hasan', 'Aminata', 'Julien', 'Emma', 'Karim', 'Léa', 'Omar']
    const code = createRoom(ownerName, ownerPseudo, availableNames)
    navigate('/lobby')
  }

  const handleJoinRoom = () => {
    if (!roomCode.trim()) return
    navigate(`/join/${roomCode}`)
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-md mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-game-purple">
            Jeu de la<br />
            <span className="text-5xl">FITNA</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Le jeu qui révèle tout entre amis
          </p>
        </div>

        {/* Main Actions */}
        <div className="space-y-6">
          {!showCreateForm ? (
            <>
              {/* Create Room */}
              <GameCard variant="beige">
                <GameCardHeader>
                  <GameCardTitle className="text-center text-game-purple">
                    Créer une partie
                  </GameCardTitle>
                </GameCardHeader>
                <GameCardContent className="text-center">
                  <p className="text-muted-foreground mb-4">
                    Invitez vos amis à rejoindre votre room
                  </p>
                  <GameButton 
                    variant="purple" 
                    size="full"
                    onClick={() => setShowCreateForm(true)}
                  >
                    Créer une room
                  </GameButton>
                </GameCardContent>
              </GameCard>

              {/* Join Room */}
              <GameCard variant="beige">
                <GameCardHeader>
                  <GameCardTitle className="text-center text-game-purple">
                    Rejoindre une partie
                  </GameCardTitle>
                </GameCardHeader>
                <GameCardContent className="space-y-4">
                  <Input
                    placeholder="Code de la room"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    className="text-center text-lg font-mono tracking-wider"
                    maxLength={6}
                  />
                  <GameButton 
                    variant="yellow" 
                    size="full"
                    onClick={handleJoinRoom}
                    disabled={roomCode.length !== 6}
                  >
                    Rejoindre
                  </GameButton>
                </GameCardContent>
              </GameCard>
            </>
          ) : (
            /* Create Room Form */
            <GameCard variant="beige">
              <GameCardHeader>
                <GameCardTitle className="text-center text-game-purple">
                  Créer votre partie
                </GameCardTitle>
              </GameCardHeader>
              <GameCardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Votre prénom</label>
                  <Input
                    placeholder="Ex: Sophie"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Votre pseudo</label>
                  <Input
                    placeholder="Ex: QueenS"
                    value={ownerPseudo}
                    onChange={(e) => setOwnerPseudo(e.target.value)}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <GameButton 
                    variant="outline" 
                    size="default"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1"
                  >
                    Retour
                  </GameButton>
                  <GameButton 
                    variant="purple" 
                    size="default"
                    onClick={handleCreateRoom}
                    disabled={!ownerName.trim() || !ownerPseudo.trim()}
                    className="flex-1"
                  >
                    Créer
                  </GameButton>
                </div>
              </GameCardContent>
            </GameCard>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Version 1.0 • Made with ❤️</p>
        </div>
      </div>
    </div>
  )
}

export default Home