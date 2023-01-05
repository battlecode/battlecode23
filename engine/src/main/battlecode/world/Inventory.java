package battlecode.world;

import battlecode.common.*;

public class Inventory {

    /**
     * The maximum amount of resources that the inventory can hold. This will be set to -1 in cases where the inventory
     * has no maximum capacity.
     */
    private int maxCapacity;

    private int adamantium;

    private int mana;

    private int elixir;

    private Anchor anchor;
    
    /**
     * Creates a new Inventory object with no maximum capacity
     */
    public Inventory() {
        maxCapacity = -1;
    }

    /**
     * Creates a new Inventory object with the given maxmimum capacity
     */
    public Inventory(int maxCapacity){
        this.maxCapacity = maxCapacity;
    }

    public void addAdamantium(int amount) {
        adamantium += amount;
    }

    public void addMana(int amount) {
        mana += amount;
    }

    public void addElixir(int amount) {
        elixir += amount;
    }

    public void pickUpAnchor(Anchor anchor) {
        this.anchor = anchor;
    }

    public void releaseAnchor() {
        assert(this.anchor != null);
        this.anchor = null;
    }
    

    public int getAdamantium() {
        return adamantium;
    }

    public int getMana() {
        return mana;
    }

    public int getElixir() {
        return elixir;
    }

    public Anchor getAnchor() {
        return anchor;
    }

    /*
     * Convenience method that adds a certain amount of the given resource
     */
    public void addResource(ResourceType type, int amount){
        if(type == ResourceType.ADAMANTIUM) adamantium += amount;
        else if(type == ResourceType.ELIXIR) elixir += amount;
        else mana += amount;
    }

    /**
     * Convenience method that returns the amount of the given resource type.
     */
    public int getResource(ResourceType type) {
        if(type == ResourceType.ADAMANTIUM) return adamantium;
        else if(type == ResourceType.ELIXIR) return elixir;
        return mana;
    }

    /**
     * Checks if the given weight of resources can be added to the inventory without going over the maximum capacity.
     */
    public boolean canAdd(int amount) {
        if(maxCapacity == -1) return true;
        int total = (anchor == null ? 0 : GameConstants.ANCHOR_WEIGHT) + adamantium + mana + elixir;
        return total + amount <= maxCapacity;
    }

    public boolean equals(Object o) {
        if (o instanceof Inventory) {
            Inventory other = (Inventory) o;
            return other.maxCapacity == this.maxCapacity && other.adamantium == this.adamantium && other.mana == this.mana && other.elixir == this.elixir && other.anchor == this.anchor;
        }
        return false;
    }

    public int hashCode() {
        return this.maxCapacity*47 + this.adamantium*37 + this.mana*41 + this.elixir*43 + this.anchor.hashCode();
    }

    public String toString() {
        return "Inventory{" +
                "maxCapacity=" + maxCapacity +
                ", adamantium=" + adamantium +
                ", mana=" + mana +
                ", elixir=" + elixir + 
                ", anchor=" + anchor +
                '}';
    }

    public Inventory copy() {
        Inventory newInventory = new Inventory(this.maxCapacity);
        newInventory.addAdamantium(this.adamantium);
        newInventory.addMana(this.mana);
        newInventory.addElixir(this.elixir);
        if (this.anchor != null) {
            newInventory.pickUpAnchor(this.anchor);
        }
        return newInventory;
    }
}
