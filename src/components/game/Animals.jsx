import Cow from './animals/Cow'
import Chicken from './animals/Chicken'
import Pig from './animals/Pig'
import Sheep from './animals/Sheep'
import Horse from './animals/Horse'

export function Animals() {
    return (
        <group>
            <Cow cx={15} cz={15} radius={5} />
            <Chicken cx={-10} cz={20} radius={3} />
            <Pig cx={25} cz={5} radius={4} />
            <Sheep cx={-20} cz={-5} radius={4} />
            <Horse cx={5} cz={-20} radius={6} />
        </group>
    )
}
