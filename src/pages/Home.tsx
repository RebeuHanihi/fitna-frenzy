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
  const [availableNames, setAvailableNames] = useState([''])
  const [error, setError] = useState('')

  const handleCreateRoom = async () => {
    if (!ownerName.trim() || !ownerPseudo.trim()) return
    
    const namesList = availableNames.filter(name => name.trim() !== '')
    if (namesList.length < 2) {
      setError('Ajoutez au moins 2 prénoms pour vos amis')
      return
    }

    try {
      const code = await createRoom(ownerName, ownerPseudo, namesList)
      navigate('/lobby')
    } catch (err) {
      setError('Erreur lors de la création de la room')
    }
  }

  const addNameField = () => {
    setAvailableNames([...availableNames, ''])
  }

  const updateName = (index: number, value: string) => {
    const updated = availableNames.map((name, i) => i === index ? value : name)
    setAvailableNames(updated)
  }

  const removeName = (index: number) => {
    if (availableNames.length > 1) {
      setAvailableNames(availableNames.filter((_, i) => i !== index))
    }
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
                {error && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                    <p className="text-destructive text-sm text-center">{error}</p>
                  </div>
                )}

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

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Prénoms de vos amis (liste pour le jeu)
                  </label>
                  <div className="space-y-2">
                    {availableNames.map((name, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder={`Prénom ${index + 1}`}
                          value={name}
                          onChange={(e) => updateName(index, e.target.value)}
                          className="flex-1"
                        />
                        {availableNames.length > 1 && (
                          <GameButton
                            variant="outline"
                            size="default"
                            onClick={() => removeName(index)}
                            className="px-3"
                          >
                            ✕
                          </GameButton>
                        )}
                      </div>
                    ))}
                    <GameButton
                      variant="outline"
                      size="default"
                      onClick={addNameField}
                      className="w-full"
                    >
                      + Ajouter un prénom
                    </GameButton>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Les joueurs choisiront parmi ces prénoms en rejoignant
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <GameButton 
                    variant="outline" 
                    size="default"
                    onClick={() => {
                      setShowCreateForm(false)
                      setError('')
                    }}
                    className="flex-1"
                  >
                    Retour
                  </GameButton>
                  <GameButton 
                    variant="purple" 
                    size="default"
                    onClick={handleCreateRoom}
                    disabled={!ownerName.trim() || !ownerPseudo.trim() || availableNames.filter(n => n.trim()).length < 2}
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