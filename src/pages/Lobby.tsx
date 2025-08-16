import React from 'react'
import { useNavigate } from 'react-router-dom'
import { GameCard, GameCardHeader, GameCardTitle, GameCardContent } from '@/components/ui/game-card'
import { GameButton } from '@/components/ui/game-button'
import { Badge } from '@/components/ui/badge'
import { useGameStore } from '@/hooks/useGameStore'
import { Users, Crown, Copy } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const Lobby = () => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { currentRoom, currentPlayer, leaveRoom } = useGameStore()

  if (!currentRoom || !currentPlayer) {
    navigate('/')
    return null
  }

  const isOwner = currentPlayer.id === currentRoom.ownerId
  const allPlayersReady = currentRoom.players.every(p => p.hasSubmittedQuestions || p.id === currentPlayer.id)

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentRoom.code)
    toast({
      description: "Code copié dans le presse-papier !",
    })
  }

  const handleStartWriting = () => {
    navigate('/questions')
  }

  const handleLeave = () => {
    leaveRoom()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header with room code */}
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-game-purple">Room</h1>
          <div 
            className="bg-game-yellow px-6 py-3 rounded-xl inline-flex items-center gap-2 cursor-pointer hover:bg-game-yellow-dark transition-colors"
            onClick={handleCopyCode}
          >
            <span className="font-mono text-xl font-bold">
              {currentRoom.code}
            </span>
            <Copy size={18} />
          </div>
          <p className="text-sm text-muted-foreground">
            Partagez ce code avec vos amis
          </p>
        </div>

        {/* Players list */}
        <GameCard variant="beige">
          <GameCardHeader>
            <GameCardTitle className="flex items-center gap-2 text-game-purple">
              <Users size={20} />
              Joueurs connectés ({currentRoom.players.length})
            </GameCardTitle>
          </GameCardHeader>
          <GameCardContent>
            <div className="space-y-3">
              {currentRoom.players.map((player) => (
                <div 
                  key={player.id}
                  className="flex items-center justify-between p-3 bg-background rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    {player.id === currentRoom.ownerId && (
                      <Crown size={16} className="text-game-yellow" />
                    )}
                    <span className="font-medium">
                      {player.pseudo}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {player.hasSubmittedQuestions && (
                      <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-300">
                        Prêt
                      </Badge>
                    )}
                    {player.id === currentPlayer.id && (
                      <Badge variant="default" className="text-xs bg-game-purple text-game-beige">
                        Vous
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </GameCardContent>
        </GameCard>

        {/* Game status */}
        {currentRoom.gamePhase === 'waiting' && (
          <GameCard variant="purple">
            <GameCardContent className="text-center">
              <h3 className="text-lg font-bold mb-2">En attente...</h3>
              <p className="text-sm opacity-90">
                {currentRoom.players.length < 3 
                  ? `Attendez au moins 3 joueurs pour commencer (${3 - currentRoom.players.length} manquant${3 - currentRoom.players.length > 1 ? 's' : ''})`
                  : "Vous pouvez commencer à écrire vos questions !"
                }
              </p>
            </GameCardContent>
          </GameCard>
        )}

        {/* Actions */}
        <div className="space-y-3">
          {currentRoom.players.length >= 3 && !currentPlayer.hasSubmittedQuestions && (
            <GameButton 
              variant="yellow" 
              size="full"
              onClick={handleStartWriting}
            >
              Écrire mes questions
            </GameButton>
          )}

          {currentPlayer.hasSubmittedQuestions && (
            <GameCard variant="beige">
              <GameCardContent className="text-center">
                <p className="text-game-purple font-medium">
                  ✅ Vos questions sont envoyées !
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {allPlayersReady 
                    ? "Tous les joueurs sont prêts ! Le jeu peut commencer."
                    : "En attente des autres joueurs..."
                  }
                </p>
              </GameCardContent>
            </GameCard>
          )}

          {isOwner && allPlayersReady && currentRoom.players.length >= 3 && (
            <GameButton 
              variant="purple" 
              size="full"
              onClick={() => navigate('/game')}
            >
              🎮 Lancer la partie !
            </GameButton>
          )}

          <GameButton 
            variant="outline" 
            size="full"
            onClick={handleLeave}
          >
            Quitter la room
          </GameButton>
        </div>

        {/* Instructions */}
        <div className="text-center text-sm text-muted-foreground space-y-1">
          <p>💡 Chaque joueur doit écrire une question pour chaque autre joueur</p>
          <p>🎯 Les questions doivent viser le prénom réel, pas le pseudo</p>
        </div>
      </div>
    </div>
  )
}

export default Lobby