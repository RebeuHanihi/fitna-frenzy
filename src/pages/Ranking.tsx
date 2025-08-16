import React from 'react'
import { useNavigate } from 'react-router-dom'
import { GameCard, GameCardHeader, GameCardTitle, GameCardContent } from '@/components/ui/game-card'
import { GameButton } from '@/components/ui/game-button'
import { useGameStore } from '@/hooks/useGameStore'
import { Trophy, Medal, Award, Home } from 'lucide-react'

const Ranking = () => {
  const navigate = useNavigate()
  const { currentRoom, currentPlayer, leaveRoom } = useGameStore()

  if (!currentRoom || !currentPlayer) {
    navigate('/')
    return null
  }

  const sortedPlayers = [...currentRoom.players].sort((a, b) => b.points - a.points)
  const playerRank = sortedPlayers.findIndex(p => p.id === currentPlayer.id) + 1

  const getEmoji = (rank: number) => {
    switch (rank) {
      case 1: return '🥇'
      case 2: return '🥈'
      case 3: return '🥉'
      default: return '🏅'
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'text-yellow-600'
      case 2: return 'text-gray-500'
      case 3: return 'text-orange-600'
      default: return 'text-muted-foreground'
    }
  }

  const handlePlayAgain = () => {
    // Reset game but keep players and points
    navigate('/lobby')
  }

  const handleNewGame = () => {
    // Reset everything
    leaveRoom()
    navigate('/')
  }

  const handleHome = () => {
    leaveRoom()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="text-6xl">{getEmoji(playerRank)}</div>
          <h1 className="text-3xl font-bold text-game-purple">
            Classement Final
          </h1>
          <p className="text-lg">
            {playerRank === 1 && "🎉 Félicitations, vous avez gagné !"}
            {playerRank === 2 && "🥈 Excellente deuxième place !"}
            {playerRank === 3 && "🥉 Beau podium !"}
            {playerRank > 3 && `Vous êtes ${playerRank}${playerRank === 4 ? 'ème' : 'ème'} !`}
          </p>
        </div>

        {/* Winner's podium */}
        <GameCard variant="purple">
          <GameCardContent className="text-center">
            <Trophy size={32} className="mx-auto mb-3" />
            <h2 className="text-xl font-bold mb-2">
              🏆 Champion de la Fitna
            </h2>
            <p className="text-lg">
              {sortedPlayers[0].pseudo}
            </p>
            <p className="text-2xl font-bold mt-2">
              {sortedPlayers[0].points} points
            </p>
          </GameCardContent>
        </GameCard>

        {/* Full ranking */}
        <GameCard variant="beige">
          <GameCardHeader>
            <GameCardTitle className="text-game-purple flex items-center gap-2">
              <Award size={20} />
              Classement complet
            </GameCardTitle>
          </GameCardHeader>
          <GameCardContent>
            <div className="space-y-3">
              {sortedPlayers.map((player, index) => (
                <div 
                  key={player.id}
                  className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                    player.id === currentPlayer.id 
                      ? 'bg-game-yellow/30 border-2 border-game-yellow' 
                      : 'bg-background'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {getEmoji(index + 1)}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">
                          {player.pseudo}
                        </span>
                        {player.id === currentPlayer.id && (
                          <span className="text-xs bg-game-purple text-game-beige px-2 py-1 rounded-full">
                            Vous
                          </span>
                        )}
                      </div>
                      <span className={`text-sm ${getRankColor(index + 1)}`}>
                        {index + 1}{index === 0 ? 'er' : 'ème'} place
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-game-purple">
                      {player.points}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      points
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GameCardContent>
        </GameCard>

        {/* Actions */}
        <div className="space-y-3">
          <GameButton 
            variant="purple" 
            size="full"
            onClick={handlePlayAgain}
            className="flex items-center gap-2"
          >
            <Medal size={18} />
            Rejouer (garder les scores)
          </GameButton>

          <GameButton 
            variant="yellow" 
            size="full"
            onClick={handleNewGame}
          >
            Nouvelle partie
          </GameButton>

          <GameButton 
            variant="outline" 
            size="full"
            onClick={handleHome}
            className="flex items-center gap-2"
          >
            <Home size={18} />
            Retour à l'accueil
          </GameButton>
        </div>

        {/* Room info */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Room: <span className="font-mono">{currentRoom.code}</span></p>
          <p>Merci d'avoir joué au Jeu de la Fitna !</p>
        </div>
      </div>
    </div>
  )
}

export default Ranking
